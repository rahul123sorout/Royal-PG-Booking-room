export interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double Share' | 'Triple Share' | 'Four Share';
  price: number;
  capacity: number;
  occupied: number;
  gender: 'Boys' | 'Girls' | 'Coliving';
  amenities: string[];
  status: 'Available' | 'Full' | 'Maintenance';
  images: string[];
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadhaar: string;
  roomId: string;
  roomNumber: string;
  joiningDate: string;
  rentAmount: number;
  status: 'Active' | 'Left' | 'Suspended';
  profilePhoto: string;
}

export interface Booking {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  price: number;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  month: string;
  dueDate: string;
  paidDate: string | null;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Cash' | null;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'booking' | 'payment' | 'vacancy';
  read: boolean;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  category: 'Plumbing' | 'Electrical' | 'Wi-Fi' | 'Cleaning' | 'AC' | 'Other';
  urgency: 'Low' | 'Medium' | 'High';
  description: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
}

// Room Images from Unsplash (Beautiful high-end interior spaces)
const ROOM_IMAGES = {
  single: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'
  ],
  double: [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'
  ],
  triple: [
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80'
  ],
  four: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'
  ]
};

export const initialRooms: Room[] = [
  {
    id: 'room-101',
    number: '101',
    type: 'Single',
    price: 18000,
    capacity: 1,
    occupied: 1,
    gender: 'Boys',
    amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom', 'Laundry', 'Meals Included'],
    status: 'Full',
    images: [ROOM_IMAGES.single[0], ROOM_IMAGES.single[1]]
  },
  {
    id: 'room-102',
    number: '102',
    type: 'Double Share',
    price: 11000,
    capacity: 2,
    occupied: 1,
    gender: 'Boys',
    amenities: ['AC', 'Wi-Fi', 'Attached Washroom', 'Housekeeping', 'Meals Included'],
    status: 'Available',
    images: [ROOM_IMAGES.double[0], ROOM_IMAGES.double[1]]
  },
  {
    id: 'room-103',
    number: '103',
    type: 'Triple Share',
    price: 7500,
    capacity: 3,
    occupied: 3,
    gender: 'Boys',
    amenities: ['Wi-Fi', 'Meals Included', 'Housekeeping', 'Gym Access'],
    status: 'Full',
    images: [ROOM_IMAGES.triple[0], ROOM_IMAGES.triple[1]]
  },
  {
    id: 'room-201',
    number: '201',
    type: 'Single',
    price: 18500,
    capacity: 1,
    occupied: 0,
    gender: 'Girls',
    amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom', 'Laundry', 'Meals Included', 'Security Camera'],
    status: 'Available',
    images: [ROOM_IMAGES.single[1], ROOM_IMAGES.single[0]]
  },
  {
    id: 'room-202',
    number: '202',
    type: 'Double Share',
    price: 11500,
    capacity: 2,
    occupied: 2,
    gender: 'Girls',
    amenities: ['AC', 'Wi-Fi', 'Attached Washroom', 'Meals Included', 'Security Camera'],
    status: 'Full',
    images: [ROOM_IMAGES.double[1], ROOM_IMAGES.double[0]]
  },
  {
    id: 'room-203',
    number: '203',
    type: 'Four Share',
    price: 6000,
    capacity: 4,
    occupied: 1,
    gender: 'Girls',
    amenities: ['Wi-Fi', 'Meals Included', 'Housekeeping', 'Security Camera'],
    status: 'Available',
    images: [ROOM_IMAGES.four[0]]
  },
  {
    id: 'room-301',
    number: '301',
    type: 'Double Share',
    price: 13000,
    capacity: 2,
    occupied: 0,
    gender: 'Coliving',
    amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Attached Washroom', 'Gym Access', 'Meals Included'],
    status: 'Available',
    images: [ROOM_IMAGES.double[0], ROOM_IMAGES.double[1]]
  },
  {
    id: 'room-302',
    number: '302',
    type: 'Single',
    price: 19500,
    capacity: 1,
    occupied: 1,
    gender: 'Coliving',
    amenities: ['AC', 'Wi-Fi', 'Smart TV', 'Balcony', 'Kitchen Access', 'Meals Included'],
    status: 'Full',
    images: [ROOM_IMAGES.single[0], ROOM_IMAGES.single[1]]
  }
];

export const initialTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    phone: '9876543210',
    aadhaar: '1234-5678-9012',
    roomId: 'room-101',
    roomNumber: '101',
    joiningDate: '2026-01-10',
    rentAmount: 18000,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'tenant-2',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@yahoo.com',
    phone: '9812345678',
    aadhaar: '9876-5432-1098',
    roomId: 'room-102',
    roomNumber: '102',
    joiningDate: '2026-03-15',
    rentAmount: 11000,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'tenant-3',
    name: 'Priya Nair',
    email: 'priya.nair@outlook.com',
    phone: '8765432109',
    aadhaar: '4567-8901-2345',
    roomId: 'room-202',
    roomNumber: '202',
    joiningDate: '2026-02-01',
    rentAmount: 11500,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'tenant-4',
    name: 'Ananya Sen',
    email: 'ananya.sen@gmail.com',
    phone: '7654321098',
    aadhaar: '3210-9876-5432',
    roomId: 'room-202',
    roomNumber: '202',
    joiningDate: '2026-04-12',
    rentAmount: 11500,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'tenant-5',
    name: 'Amit Patel',
    email: 'amit.patel@gmail.com',
    phone: '8901234567',
    aadhaar: '6543-2109-8765',
    roomId: 'room-103',
    roomNumber: '103',
    joiningDate: '2026-02-20',
    rentAmount: 7500,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'tenant-6',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@outlook.com',
    phone: '9012345678',
    aadhaar: '5432-1098-7654',
    roomId: 'room-302',
    roomNumber: '302',
    joiningDate: '2026-05-01',
    rentAmount: 19500,
    status: 'Active',
    profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

export const initialBookings: Booking[] = [
  {
    id: 'booking-1',
    tenantName: 'Siddharth Roy',
    tenantEmail: 'sid.roy@gmail.com',
    tenantPhone: '9560123456',
    roomId: 'room-102',
    roomNumber: '102',
    roomType: 'Double Share',
    price: 11000,
    bookingDate: '2026-06-12',
    status: 'Pending'
  },
  {
    id: 'booking-2',
    tenantName: 'Meera Deshmukh',
    tenantEmail: 'meera.d@gmail.com',
    tenantPhone: '9890123456',
    roomId: 'room-201',
    roomNumber: '201',
    roomType: 'Single',
    price: 18500,
    bookingDate: '2026-06-14',
    status: 'Confirmed'
  }
];

export const initialPayments: Payment[] = [
  // Vikram Singh (Room 101) - Paid
  {
    id: 'pay-1',
    tenantId: 'tenant-1',
    tenantName: 'Vikram Singh',
    roomNumber: '101',
    amount: 18000,
    month: 'June 2026',
    dueDate: '2026-06-05',
    paidDate: '2026-06-04',
    status: 'Paid',
    paymentMethod: 'UPI'
  },
  // Rahul Sharma (Room 102) - Pending
  {
    id: 'pay-2',
    tenantId: 'tenant-2',
    tenantName: 'Rahul Sharma',
    roomNumber: '102',
    amount: 11000,
    month: 'June 2026',
    dueDate: '2026-06-05',
    paidDate: null,
    status: 'Pending',
    paymentMethod: null
  },
  // Priya Nair (Room 202) - Overdue
  {
    id: 'pay-3',
    tenantId: 'tenant-3',
    tenantName: 'Priya Nair',
    roomNumber: '202',
    amount: 11500,
    month: 'June 2026',
    dueDate: '2026-06-05',
    paidDate: null,
    status: 'Overdue',
    paymentMethod: null
  },
  // Ananya Sen (Room 202) - Paid
  {
    id: 'pay-4',
    tenantId: 'tenant-4',
    tenantName: 'Ananya Sen',
    roomNumber: '202',
    amount: 11500,
    month: 'June 2026',
    dueDate: '2026-06-05',
    paidDate: '2026-06-03',
    status: 'Paid',
    paymentMethod: 'Card'
  },
  // Amit Patel (Room 103) - Paid
  {
    id: 'pay-5',
    tenantId: 'tenant-5',
    tenantName: 'Amit Patel',
    roomNumber: '103',
    amount: 7500,
    month: 'June 2026',
    dueDate: '2026-06-05',
    paidDate: '2026-06-05',
    status: 'Paid',
    paymentMethod: 'Net Banking'
  },
  // Rohan Gupta (Room 302) - Pending
  {
    id: 'pay-6',
    tenantId: 'tenant-6',
    tenantName: 'Rohan Gupta',
    roomNumber: '302',
    amount: 19500,
    month: 'June 2026',
    dueDate: '2026-06-05',
    paidDate: null,
    status: 'Pending',
    paymentMethod: null
  },
  // Older payments for history
  {
    id: 'pay-old-1',
    tenantId: 'tenant-1',
    tenantName: 'Vikram Singh',
    roomNumber: '101',
    amount: 18000,
    month: 'May 2026',
    dueDate: '2026-05-05',
    paidDate: '2026-05-03',
    status: 'Paid',
    paymentMethod: 'UPI'
  },
  {
    id: 'pay-old-2',
    tenantId: 'tenant-3',
    tenantName: 'Priya Nair',
    roomNumber: '202',
    amount: 11500,
    month: 'May 2026',
    dueDate: '2026-05-05',
    paidDate: '2026-05-05',
    status: 'Paid',
    paymentMethod: 'UPI'
  }
];

export const initialAlerts: AlertNotification[] = [
  {
    id: 'alert-1',
    title: 'Payment Due Alert',
    message: 'Rent payment for Rahul Sharma (Room 102) is pending.',
    date: '2026-06-06',
    type: 'payment',
    read: false
  },
  {
    id: 'alert-2',
    title: 'Overdue Payment Alert',
    message: 'Rent payment for Priya Nair (Room 202) is overdue by 9 days.',
    date: '2026-06-14',
    type: 'payment',
    read: false
  },
  {
    id: 'alert-3',
    title: 'New Booking Request',
    message: 'Siddharth Roy has requested a Double Share room in Room 102.',
    date: '2026-06-12',
    type: 'booking',
    read: false
  },
  {
    id: 'alert-4',
    title: 'Room Vacancy Notification',
    message: 'Room 201 (Girls Single AC) is now vacant.',
    date: '2026-06-14',
    type: 'vacancy',
    read: true
  }
];

export const initialMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'mreq-1',
    tenantId: 'tenant-2',
    tenantName: 'Rahul Sharma',
    roomNumber: '102',
    category: 'Wi-Fi',
    urgency: 'Medium',
    description: 'High packet loss and slow connection speed since yesterday morning.',
    date: '2026-06-13',
    status: 'In Progress'
  },
  {
    id: 'mreq-2',
    tenantId: 'tenant-3',
    tenantName: 'Priya Nair',
    roomNumber: '202',
    category: 'Plumbing',
    urgency: 'High',
    description: 'Water leakage in the washroom flush tank. Continuous overflow.',
    date: '2026-06-14',
    status: 'Pending'
  }
];

// Helper to manage and load states from localStorage
export const getStoredData = <T>(key: string, initialData: T): T => {
  if (typeof window === 'undefined') return initialData;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initialData;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return initialData;
  }
};

export const setStoredData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};
