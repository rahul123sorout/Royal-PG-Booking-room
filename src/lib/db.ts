import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';

// High-Fidelity In-Memory MongoDB Database Mock
interface GlobalWithStore {
  _mockDbStore?: Record<string, any[]>;
}

const globalWithStore = global as typeof globalThis & GlobalWithStore;
if (!globalWithStore._mockDbStore) {
  globalWithStore._mockDbStore = {};
}
const globalStore = globalWithStore._mockDbStore;

function matches(doc: any, query: any): boolean {
  if (!query) return true;
  for (const key in query) {
    const val = query[key];
    if (key === '$or' && Array.isArray(val)) {
      const matchAny = val.some((subQuery: any) => matches(doc, subQuery));
      if (!matchAny) return false;
      continue;
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Operator support ($ne, $in, $nin, $gt, $lt, $gte, $lte)
      for (const op in val) {
        const opVal = val[op];
        if (op === '$ne') {
          if (doc[key] === opVal) return false;
        } else if (op === '$in') {
          if (!Array.isArray(opVal) || !opVal.includes(doc[key])) return false;
        } else if (op === '$nin') {
          if (Array.isArray(opVal) && opVal.includes(doc[key])) return false;
        } else if (op === '$gt') {
          if (doc[key] <= opVal) return false;
        } else if (op === '$lt') {
          if (doc[key] >= opVal) return false;
        } else if (op === '$gte') {
          if (doc[key] < opVal) return false;
        } else if (op === '$lte') {
          if (doc[key] > opVal) return false;
        }
      }
    } else {
      if (doc[key] !== val) return false;
    }
  }
  return true;
}

function updateDoc(doc: any, update: any, isInsert: boolean = false) {
  if (update.$set) {
    for (const key in update.$set) {
      doc[key] = update.$set[key];
    }
  }
  if (update.$inc) {
    for (const key in update.$inc) {
      doc[key] = (doc[key] || 0) + update.$inc[key];
    }
  }
  if (update.$push) {
    for (const key in update.$push) {
      if (!Array.isArray(doc[key])) {
        doc[key] = [];
      }
      doc[key].push(update.$push[key]);
    }
  }
  if (isInsert && update.$setOnInsert) {
    for (const key in update.$setOnInsert) {
      doc[key] = update.$setOnInsert[key];
    }
  }
}

function sortDocs(docs: any[], sortObj: any) {
  if (!sortObj) return docs;
  const key = Object.keys(sortObj)[0];
  const order = sortObj[key]; // 1 = asc, -1 = desc
  return [...docs].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (valA < valB) return order === 1 ? -1 : 1;
    return order === 1 ? 1 : -1;
  });
}

class MockCollection {
  name: string;
  constructor(name: string) {
    this.name = name;
    if (!globalStore[name]) {
      globalStore[name] = [];
    }
  }

  find(query: any = {}) {
    const list = globalStore[this.name].filter((doc: any) => matches(doc, query));
    return {
      sort: (sortObj: any) => {
        const sorted = sortDocs(list, sortObj);
        return {
          toArray: async () => sorted
        };
      },
      toArray: async () => list
    };
  }

  async findOne(query: any = {}) {
    const found = globalStore[this.name].find((doc: any) => matches(doc, query));
    return found || null;
  }

  async insertOne(doc: any) {
    const newDoc = { ...doc };
    if (!newDoc.id && !newDoc.uid) {
      newDoc.id = Math.random().toString(36).substring(2, 11);
    }
    if (!newDoc._id) {
      newDoc._id = Math.random().toString(36).substring(2, 11);
    }
    globalStore[this.name].push(newDoc);
    return { acknowledged: true, insertedId: newDoc._id };
  }

  async insertMany(docs: any[]) {
    const insertedDocs = docs.map(doc => {
      const newDoc = { ...doc };
      if (!newDoc.id && !newDoc.uid) {
        newDoc.id = Math.random().toString(36).substring(2, 11);
      }
      if (!newDoc._id) {
        newDoc._id = Math.random().toString(36).substring(2, 11);
      }
      return newDoc;
    });
    globalStore[this.name].push(...insertedDocs);
    return { acknowledged: true, insertedCount: docs.length };
  }

  async updateOne(query: any, update: any, options?: { upsert?: boolean }) {
    let doc = globalStore[this.name].find((doc: any) => matches(doc, query));
    if (doc) {
      updateDoc(doc, update, false);
      return { acknowledged: true, modifiedCount: 1, matchedCount: 1 };
    } else if (options?.upsert) {
      const newDoc: any = {};
      
      // Copy literal fields from query to the new document
      for (const key in query) {
        if (!key.startsWith('$') && typeof query[key] !== 'object') {
          newDoc[key] = query[key];
        }
      }
      
      // Apply the update
      updateDoc(newDoc, update, true);
      
      if (!newDoc.id && !newDoc.uid) {
        newDoc.id = this.name.startsWith('user') ? 'user-' + Math.random().toString(36).substring(2, 9) : Math.random().toString(36).substring(2, 11);
      }
      if (!newDoc._id) {
        newDoc._id = Math.random().toString(36).substring(2, 11);
      }
      
      globalStore[this.name].push(newDoc);
      return { acknowledged: true, modifiedCount: 1, matchedCount: 0, upsertedId: newDoc._id };
    }
    return { acknowledged: true, modifiedCount: 0, matchedCount: 0 };
  }

  async updateMany(query: any, update: any) {
    const docs = globalStore[this.name].filter((doc: any) => matches(doc, query));
    docs.forEach((doc: any) => updateDoc(doc, update));
    return { acknowledged: true, modifiedCount: docs.length };
  }

  async deleteOne(query: any) {
    const index = globalStore[this.name].findIndex((doc: any) => matches(doc, query));
    if (index !== -1) {
      globalStore[this.name].splice(index, 1);
    }
    return { acknowledged: true, deletedCount: index !== -1 ? 1 : 0 };
  }

  async deleteMany(query: any = {}) {
    const originalLength = globalStore[this.name].length;
    globalStore[this.name] = globalStore[this.name].filter((doc: any) => !matches(doc, query));
    const deletedCount = originalLength - globalStore[this.name].length;
    return { acknowledged: true, deletedCount };
  }
}

function seedDatabaseIfEmpty() {
  if (globalStore['rooms'] && globalStore['rooms'].length > 0) {
    return; // Already seeded
  }

  // Initialize arrays
  globalStore['users'] = [];
  globalStore['rooms'] = [];
  globalStore['tenants'] = [];
  globalStore['bookings'] = [];
  globalStore['payments'] = [];
  globalStore['alerts'] = [];
  globalStore['maintenance'] = [];
  globalStore['otps'] = [];

  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const tenantPasswordHash = bcrypt.hashSync('password123', 10);

  // 1. Seed users
  globalStore['users'].push({
    uid: 'user-admin',
    name: 'Royal PG Admin',
    email: 'admin@royalpg.com',
    phone: '9999911111',
    aadhaar: '1111-2222-3333',
    password: adminPasswordHash,
    role: 'admin',
    joinedDate: '2026-01-01'
  });

  // 2. Seed rooms
  const rooms = [
    { id: 'room-101', number: '101', type: 'Single', price: 18000, capacity: 1, occupied: 1, gender: 'Boys', amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom', 'Laundry', 'Meals Included'], status: 'Full', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-102', number: '102', type: 'Double Share', price: 11000, capacity: 2, occupied: 2, gender: 'Boys', amenities: ['AC', 'Wi-Fi', 'Attached Washroom', 'Housekeeping', 'Meals Included'], status: 'Full', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-103', number: '103', type: 'Triple Share', price: 7500, capacity: 3, occupied: 3, gender: 'Boys', amenities: ['Wi-Fi', 'Meals Included', 'Housekeeping', 'Gym Access'], status: 'Full', images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-104', number: '104', type: 'Single', price: 18000, capacity: 1, occupied: 0, gender: 'Boys', amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom'], status: 'Available', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-201', number: '201', type: 'Single', price: 18500, capacity: 1, occupied: 1, gender: 'Girls', amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom', 'Laundry', 'Meals Included', 'Security Camera'], status: 'Full', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-202', number: '202', type: 'Double Share', price: 11500, capacity: 2, occupied: 2, gender: 'Girls', amenities: ['AC', 'Wi-Fi', 'Attached Washroom', 'Meals Included', 'Security Camera'], status: 'Full', images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-203', number: '203', type: 'Four Share', price: 6000, capacity: 4, occupied: 4, gender: 'Girls', amenities: ['Wi-Fi', 'Meals Included', 'Housekeeping', 'Security Camera'], status: 'Full', images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-204', number: '204', type: 'Double Share', price: 11500, capacity: 2, occupied: 0, gender: 'Girls', amenities: ['AC', 'Wi-Fi', 'Attached Washroom'], status: 'Available', images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-301', number: '301', type: 'Double Share', price: 13000, capacity: 2, occupied: 2, gender: 'Coliving', amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom', 'Gym Access', 'Meals Included'], status: 'Full', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-302', number: '302', type: 'Single', price: 19500, capacity: 1, occupied: 1, gender: 'Coliving', amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Balcony', 'Kitchen Access', 'Meals Included'], status: 'Full', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-303', number: '303', type: 'Double Share', price: 13000, capacity: 2, occupied: 0, gender: 'Coliving', amenities: ['AC', 'Wi-Fi', 'Gym Access'], status: 'Available', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'] },
    { id: 'room-304', number: '304', type: 'Single', price: 19500, capacity: 1, occupied: 0, gender: 'Coliving', amenities: ['AC', 'Wi-Fi', 'Balcony'], status: 'Available', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'] }
  ];
  globalStore['rooms'].push(...rooms);

  // 3. Seed tenants
  const tenants = [
    { id: 'tenant-1', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9876543201', aadhaar: '1234-5678-9001', roomId: 'room-101', roomNumber: '101', joiningDate: '2026-01-10', rentAmount: 18000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-2', name: 'Rahul Sharma', email: 'rahul.sharma@yahoo.com', phone: '9812345602', aadhaar: '9876-5432-1002', roomId: 'room-102', roomNumber: '102', joiningDate: '2026-03-15', rentAmount: 11000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-3', name: 'Priya Nair', email: 'priya.nair@outlook.com', phone: '8765432103', aadhaar: '4567-8901-2003', roomId: 'room-202', roomNumber: '202', joiningDate: '2026-02-01', rentAmount: 11500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-4', name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '7654321004', aadhaar: '3210-9876-5004', roomId: 'room-202', roomNumber: '202', joiningDate: '2026-04-12', rentAmount: 11500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-5', name: 'Amit Patel', email: 'amit.patel@gmail.com', phone: '8901234505', aadhaar: '6543-2109-8005', roomId: 'room-103', roomNumber: '103', joiningDate: '2026-02-20', rentAmount: 7500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-6', name: 'Rohan Gupta', email: 'rohan.gupta@outlook.com', phone: '9012345606', aadhaar: '5432-1098-7006', roomId: 'room-302', roomNumber: '302', joiningDate: '2026-05-01', rentAmount: 19500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-7', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '9123456707', aadhaar: '4321-0987-6007', roomId: 'room-203', roomNumber: '203', joiningDate: '2026-03-01', rentAmount: 6000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-8', name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '9234567808', aadhaar: '3219-8765-4008', roomId: 'room-103', roomNumber: '103', joiningDate: '2026-04-01', rentAmount: 7500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-9', name: 'Divya Teja', email: 'divya.teja@yahoo.com', phone: '9345678909', aadhaar: '2109-8765-4309', roomId: 'room-203', roomNumber: '203', joiningDate: '2026-02-15', rentAmount: 6000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-10', name: 'Kunal Kapoor', email: 'kunal.k@gmail.com', phone: '9456789010', aadhaar: '1098-7654-3210', roomId: 'room-102', roomNumber: '102', joiningDate: '2026-05-10', rentAmount: 11000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-11', name: 'Neha Bhatia', email: 'neha.b@gmail.com', phone: '9567890111', aadhaar: '2189-3278-4391', roomId: 'room-201', roomNumber: '201', joiningDate: '2026-01-20', rentAmount: 18500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-12', name: 'Yash Vardhan', email: 'yash.v@gmail.com', phone: '9678901212', aadhaar: '3291-3829-4328', roomId: 'room-103', roomNumber: '103', joiningDate: '2026-03-20', rentAmount: 7500, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-13', name: 'Riya Bansal', email: 'riya.b@gmail.com', phone: '9789012313', aadhaar: '4389-2312-3290', roomId: 'room-203', roomNumber: '203', joiningDate: '2026-05-01', rentAmount: 6000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-14', name: 'Varun Dhawan', email: 'varun.d@gmail.com', phone: '9890123414', aadhaar: '5490-3291-3819', roomId: 'room-301', roomNumber: '301', joiningDate: '2026-02-10', rentAmount: 13000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-15', name: 'Kavita Rao', email: 'kavita.r@gmail.com', phone: '9901234515', aadhaar: '6591-3291-3891', roomId: 'room-203', roomNumber: '203', joiningDate: '2026-04-15', rentAmount: 6000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-16', name: 'Manish Pandey', email: 'manish.p@gmail.com', phone: '9012345616', aadhaar: '7691-3819-3291', roomId: 'room-301', roomNumber: '301', joiningDate: '2026-03-01', rentAmount: 13000, status: 'Active', profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-17', name: 'Pooja Mishra', email: 'pooja.m@gmail.com', phone: '9023456717', aadhaar: '8791-3891-2309', roomId: 'room-201', roomNumber: '201', joiningDate: '2026-01-05', rentAmount: 18500, status: 'Left', profilePhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-18', name: 'Aditya Roy', email: 'aditya.r@gmail.com', phone: '9034567818', aadhaar: '9891-2891-3298', roomId: 'room-101', roomNumber: '101', joiningDate: '2026-02-01', rentAmount: 18000, status: 'Left', profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-19', name: 'Simran Kaur', email: 'simran.k@gmail.com', phone: '9045678919', aadhaar: '1092-3891-3891', roomId: 'room-202', roomNumber: '202', joiningDate: '2026-01-15', rentAmount: 11500, status: 'Left', profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
    { id: 'tenant-20', name: 'Sanjay Dutt', email: 'sanjay.d@gmail.com', phone: '9056789020', aadhaar: '2192-3819-3290', roomId: 'room-102', roomNumber: '102', joiningDate: '2026-02-10', rentAmount: 11000, status: 'Left', profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80' }
  ];
  globalStore['tenants'].push(...tenants);

  // 4. Seed user accounts for tenants
  for (const t of tenants) {
    globalStore['users'].push({
      uid: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      aadhaar: t.aadhaar,
      password: tenantPasswordHash,
      role: 'tenant',
      joinedDate: t.joiningDate
    });
  }

  // 5. Seed bookings
  const bookings = [
    { id: 'booking-1', tenantName: 'Siddharth Roy', tenantEmail: 'sid.roy@gmail.com', tenantPhone: '9560123456', roomId: 'room-104', roomNumber: '104', roomType: 'Single', price: 18000, bookingDate: '2026-06-12', status: 'Pending' },
    { id: 'booking-2', tenantName: 'Meera Deshmukh', tenantEmail: 'meera.d@gmail.com', tenantPhone: '9890123456', roomId: 'room-204', roomNumber: '204', roomType: 'Double Share', price: 11500, bookingDate: '2026-06-14', status: 'Confirmed' }
  ];
  globalStore['bookings'].push(...bookings);

  // 6. Seed payments
  const payments = [
    { id: 'pay-1', tenantId: 'tenant-1', tenantName: 'Vikram Singh', roomNumber: '101', amount: 18000, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-04', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-4', tenantId: 'tenant-4', tenantName: 'Ananya Sen', roomNumber: '202', amount: 11500, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-03', status: 'Paid', paymentMethod: 'Card' },
    { id: 'pay-5', tenantId: 'tenant-5', tenantName: 'Amit Patel', roomNumber: '103', amount: 7500, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-05', status: 'Paid', paymentMethod: 'Net Banking' },
    { id: 'pay-7', tenantId: 'tenant-7', tenantName: 'Sneha Reddy', roomNumber: '203', amount: 6000, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-04', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-10', tenantId: 'tenant-10', tenantName: 'Kunal Kapoor', roomNumber: '102', amount: 11000, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-05', status: 'Paid', paymentMethod: 'Cash' },
    { id: 'pay-11', tenantId: 'tenant-11', tenantName: 'Neha Bhatia', roomNumber: '201', amount: 18500, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-02', status: 'Paid', paymentMethod: 'Card' },
    { id: 'pay-12', tenantId: 'tenant-12', tenantName: 'Yash Vardhan', roomNumber: '103', amount: 7500, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-05', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-14', tenantId: 'tenant-14', tenantName: 'Varun Dhawan', roomNumber: '301', amount: 13000, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-03', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-15', tenantId: 'tenant-15', tenantName: 'Kavita Rao', roomNumber: '203', amount: 6000, month: 'June 2026', dueDate: '2026-06-05', paidDate: '2026-06-04', status: 'Paid', paymentMethod: 'Cash' },
    { id: 'pay-2', tenantId: 'tenant-2', tenantName: 'Rahul Sharma', roomNumber: '102', amount: 11000, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Pending', paymentMethod: null },
    { id: 'pay-6', tenantId: 'tenant-6', tenantName: 'Rohan Gupta', roomNumber: '302', amount: 19500, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Pending', paymentMethod: null },
    { id: 'pay-8', tenantId: 'tenant-8', tenantName: 'Arjun Mehta', roomNumber: '103', amount: 7500, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Pending', paymentMethod: null },
    { id: 'pay-13', tenantId: 'tenant-13', tenantName: 'Riya Bansal', roomNumber: '203', amount: 6000, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Pending', paymentMethod: null },
    { id: 'pay-3', tenantId: 'tenant-3', tenantName: 'Priya Nair', roomNumber: '202', amount: 11500, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Overdue', paymentMethod: null },
    { id: 'pay-9', tenantId: 'tenant-9', tenantName: 'Divya Teja', roomNumber: '203', amount: 6000, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Overdue', paymentMethod: null },
    { id: 'pay-16', tenantId: 'tenant-16', tenantName: 'Manish Pandey', roomNumber: '301', amount: 13000, month: 'June 2026', dueDate: '2026-06-05', paidDate: null, status: 'Overdue', paymentMethod: null },
    { id: 'pay-17', tenantId: 'tenant-17', tenantName: 'Pooja Mishra', roomNumber: '201', amount: 18500, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-03', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-18', tenantId: 'tenant-18', tenantName: 'Aditya Roy', roomNumber: '101', amount: 18000, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-04', status: 'Paid', paymentMethod: 'Cash' },
    { id: 'pay-19', tenantId: 'tenant-19', tenantName: 'Simran Kaur', roomNumber: '202', amount: 11500, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-02', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-20', tenantId: 'tenant-20', tenantName: 'Sanjay Dutt', roomNumber: '102', amount: 11000, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-03', status: 'Paid', paymentMethod: 'Card' },
    { id: 'pay-old-1', tenantId: 'tenant-1', tenantName: 'Vikram Singh', roomNumber: '101', amount: 18000, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-03', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-old-2', tenantId: 'tenant-3', tenantName: 'Priya Nair', roomNumber: '202', amount: 11500, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-05', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-old-3', tenantId: 'tenant-2', tenantName: 'Rahul Sharma', roomNumber: '102', amount: 11000, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-05', status: 'Paid', paymentMethod: 'UPI' },
    { id: 'pay-old-4', tenantId: 'tenant-5', tenantName: 'Amit Patel', roomNumber: '103', amount: 7500, month: 'May 2026', dueDate: '2026-05-05', paidDate: '2026-05-04', status: 'Paid', paymentMethod: 'UPI' }
  ];
  globalStore['payments'].push(...payments);

  // 7. Seed alerts
  const alerts = [
    { id: 'alert-1', title: 'Payment Due Alert', message: 'Rent payment for Rahul Sharma (Room 102) is pending.', date: '2026-06-06', type: 'payment', read: false },
    { id: 'alert-2', title: 'Overdue Payment Alert', message: 'Rent payment for Priya Nair (Room 202) is overdue.', date: '2026-06-14', type: 'payment', read: false },
    { id: 'alert-3', title: 'New Booking Request', message: 'Siddharth Roy has requested Room 104.', date: '2026-06-12', type: 'booking', read: false }
  ];
  globalStore['alerts'].push(...alerts);

  // 8. Seed maintenance requests
  const maintenance = [
    { id: 'mreq-1', tenantId: 'tenant-2', tenantName: 'Rahul Sharma', roomNumber: '102', category: 'Wi-Fi', urgency: 'Medium', description: 'High packet loss and slow connection speed since yesterday.', date: '2026-06-13', status: 'In Progress' },
    { id: 'mreq-2', tenantId: 'tenant-3', tenantName: 'Priya Nair', roomNumber: '202', category: 'Plumbing', urgency: 'High', description: 'Water leakage in the washroom flush tank. Continuous overflow.', date: '2026-06-14', status: 'Pending' }
  ];
  globalStore['maintenance'].push(...maintenance);
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  seedDatabaseIfEmpty();
  const db = {
    collection: (name: string) => new MockCollection(name)
  };
  return { client: {} as any, db: db as any };
}

