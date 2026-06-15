'use client';

import React, { useState, useEffect } from 'react';
import { usePGData } from '../../context/PGContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Search, SlidersHorizontal, Bed, ShieldCheck, Wifi, 
  Tv, Compass, CheckCircle2, User, Phone, Mail, X, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RoomsPage() {
  const { rooms, createBooking } = usePGData();
  const { user } = useAuth();
  const router = useRouter();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Booking Modal State
  const [bookingRoom, setBookingRoom] = useState<any | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setGuestName(user.name);
      setGuestEmail(user.email);
      setGuestPhone(user.phone);
    }
  }, [user]);

  // Filter Rooms Logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.amenities.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || room.type === selectedType;
    const matchesGender = selectedGender === 'all' || room.gender === selectedGender;
    
    let matchesPrice = true;
    if (selectedPrice === 'under-8k') matchesPrice = room.price < 8000;
    else if (selectedPrice === '8k-12k') matchesPrice = room.price >= 8000 && room.price <= 12000;
    else if (selectedPrice === '12k-18k') matchesPrice = room.price > 12000 && room.price <= 18000;
    else if (selectedPrice === 'above-18k') matchesPrice = room.price > 18000;

    const matchesAvailability = !onlyAvailable || room.occupied < room.capacity;

    return matchesSearch && matchesType && matchesGender && matchesPrice && matchesAvailability;
  });

  const handleOpenBooking = (room: any) => {
    setBookingRoom(room);
    setBookingStatus(null);
    setTermsAccepted(false);
  };

  const handleCloseBooking = () => {
    setBookingRoom(null);
    setBookingStatus(null);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#bc8e50', '#ffffff', '#caa872']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#bc8e50', '#ffffff', '#caa872']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !guestEmail) {
      setBookingStatus({ success: false, message: 'Please fill in all fields.' });
      return;
    }
    if (!termsAccepted) {
      setBookingStatus({ success: false, message: 'Please accept the co-living guidelines.' });
      return;
    }

    setSubmitting(true);
    setBookingStatus(null);

    const result = await createBooking({
      tenantName: guestName,
      tenantEmail: guestEmail,
      tenantPhone: guestPhone,
      roomId: bookingRoom.id,
      roomNumber: bookingRoom.number,
      roomType: bookingRoom.type,
      price: bookingRoom.price
    });

    setSubmitting(false);
    if (result.success) {
      setBookingStatus({ success: true, message: result.message });
      triggerConfetti();
      setTimeout(() => {
        handleCloseBooking();
        // Redirect to dashboard if logged in, otherwise let them browse
        if (user) {
          router.push('/dashboard');
        }
      }, 5000);
    } else {
      setBookingStatus({ success: false, message: result.message });
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="text-center md:text-left mb-10 space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Explore Available Suites</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Premium single & sharing PG rooms in Noida with state-of-the-art facilities. Filter and book instantly.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Room No. or amenities (AC, Tv...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Room Type */}
          <div className="lg:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
            >
              <option value="all">All Room Types</option>
              <option value="Single">Single Room</option>
              <option value="Double Share">Double Sharing</option>
              <option value="Triple Share">Triple Sharing</option>
              <option value="Four Share">Four Sharing</option>
            </select>
          </div>

          {/* Gender */}
          <div className="lg:col-span-2">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
            >
              <option value="all">All Wing Types</option>
              <option value="Boys">Boys Only</option>
              <option value="Girls">Girls Only</option>
              <option value="Coliving">Co-Living Wing</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="lg:col-span-2">
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900/60 border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
            >
              <option value="all">All Price Ranges</option>
              <option value="under-8k">Under ₹8,000</option>
              <option value="8k-12k">₹8,000 - ₹12,000</option>
              <option value="12k-18k">₹12,000 - ₹18,000</option>
              <option value="above-18k">Above ₹18,000</option>
            </select>
          </div>

          {/* Toggle */}
          <div className="lg:col-span-2 flex items-center justify-start lg:justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-500"
              />
              <span className="text-xs text-muted-foreground font-medium">Only Vacant Beds</span>
            </label>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-md mx-auto mt-12 space-y-3">
          <Compass className="h-10 w-10 text-gold-500 mx-auto" />
          <h3 className="font-serif font-bold text-foreground">No Chambers Match</h3>
          <p className="text-xs text-muted-foreground">
            We couldn&apos;t find any rooms matching your search parameters. Try clearing some filters or searching for different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => {
            const isFull = room.occupied >= room.capacity;
            const isMaintenance = room.status === 'Maintenance';
            const availableBeds = room.capacity - room.occupied;
            const isBookable = !isFull && !isMaintenance;

            return (
              <div 
                key={room.id}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Room Image */}
                <div className="h-48 relative overflow-hidden bg-neutral-100">
                  <img 
                    src={room.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'} 
                    alt={`Room ${room.number}`}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  {/* Price Tag */}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md border border-border px-3 py-1 rounded-xl shadow-sm text-xs font-semibold">
                    ₹{room.price.toLocaleString('en-IN')}<span className="text-[10px] text-muted-foreground font-normal">/mo</span>
                  </div>
                  {/* Gender badge */}
                  <div className={`absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${
                    room.gender === 'Boys' ? 'bg-blue-600' : room.gender === 'Girls' ? 'bg-pink-600' : 'bg-purple-600'
                  }`}>
                    {room.gender} Wing
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header: Room info */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground">Room {room.number}</h3>
                      <div className="flex gap-1.5 items-center">
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          isMaintenance 
                            ? 'bg-neutral-500/10 text-neutral-500 dark:bg-neutral-500/20' 
                            : isFull
                            ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20'
                        }`}>
                          {room.status}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gold-500 tracking-wider bg-gold-500/10 px-2 py-0.5 rounded">
                          {room.type}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for occupancy */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                        <span>Occupancy Capacity</span>
                        <span>{room.occupied}/{room.capacity} Beds Booked</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold-500 transition-all duration-300"
                          style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Amenities list */}
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-[9px] bg-neutral-50 dark:bg-neutral-900 border border-border/80 text-muted-foreground px-2 py-0.5 rounded-full font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-[9px] text-gold-500 font-semibold px-2 py-0.5">
                          +{room.amenities.length - 4} More
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground font-semibold">
                      {isMaintenance ? (
                        <span className="text-neutral-500 font-medium">Under Maintenance</span>
                      ) : isFull ? (
                        <span className="text-red-500">Waitlist Available</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">{availableBeds} beds vacant</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenBooking(room)}
                      disabled={!isBookable}
                      className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                        !isBookable 
                          ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed'
                          : 'bg-gold-500 hover:bg-gold-600 text-white shadow-sm shadow-gold-500/10 hover:shadow-gold-500/20 active:scale-95'
                      }`}
                    >
                      {isMaintenance ? 'Maintenance' : isFull ? 'Room Full' : 'Book Now'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ==================== BOOKING MODAL ==================== */}
      {bookingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Close */}
            <button 
              onClick={handleCloseBooking}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Secure Suite Reservation</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Room {bookingRoom.number} ({bookingRoom.type}) - {bookingRoom.gender} Wing
              </p>
            </div>

            {/* Price Preview Card */}
            <div className="bg-gold-500/5 border border-gold-500/20 p-4 rounded-xl flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gold-500" />
                <span className="text-xs font-semibold text-foreground">Monthly Luxury Rent</span>
              </div>
              <span className="text-base font-bold text-gold-500">₹{bookingRoom.price.toLocaleString('en-IN')} / mo</span>
            </div>

            {/* Error/Success messages inside modal */}
            {bookingStatus && (
              <div className={`p-4 rounded-xl text-xs mb-5 border ${
                bookingStatus.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                <div className="flex gap-2 items-start">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{bookingStatus.message}</span>
                </div>
              </div>
            )}

            {/* Booking Form */}
            {!(bookingStatus?.success) && (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Tenant Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        placeholder="10-digit number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-border text-gold-500 focus:ring-gold-500 mt-0.5"
                    />
                    <span className="text-[10px] text-muted-foreground leading-relaxed">
                      I agree to the <strong>Royal Co-Living Guidelines</strong>: 1-month security token deposit (fully refundable), 30-day checkout notices, and verification of original Aadhaar card at branch check-in.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/80 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseBooking}
                    className="flex-1 border border-border text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-xs py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-xl shadow-md text-xs active:scale-98 disabled:opacity-70 flex items-center justify-center gap-1"
                  >
                    {submitting ? 'Requesting Room...' : 'Confirm Reservation'}
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Post Confirmation Instructions */}
            {bookingStatus?.success && (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  The admin has been notified of your reservation! A simulated invoice of <strong>₹{bookingRoom.price.toLocaleString('en-IN')}</strong> has been added. If you are signed in, check your <strong>Dashboard</strong> to complete your invoice.
                </p>
                <div className="text-[10px] text-gold-500 font-bold uppercase tracking-widest animate-pulse">
                  🎆 Celebration Confetti Fired!
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
