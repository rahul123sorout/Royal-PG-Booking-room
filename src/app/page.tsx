'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wifi, Shield, Dumbbell, Coffee, Flame, Radio, Bed, 
  MapPin, CheckCircle, ArrowRight, UserPlus, PhoneCall, Star, 
  Award, Heart, ShieldCheck
} from 'lucide-react';
import MapCard from '../components/MapCard';

const FACILITIES = [
  { icon: Wifi, title: 'High-Speed Wi-Fi', desc: 'Enterprise gigabit connection with routers on every floor for lag-free studies & remote work.' },
  { icon: Shield, title: '3-Tier Security', desc: 'CCTV surveillance, biometric entry gates, and 24/7 security guards to ensure absolute safety.' },
  { icon: Coffee, title: 'Gourmet Meals', desc: 'Hygienic, home-style North & South Indian meals prepared daily by certified chefs in our clean pantry.' },
  { icon: Dumbbell, title: 'Modern Fitness Gym', desc: 'Fully equipped fitness zone with cardio machines, free weights, and cross-fit sections.' },
  { icon: Flame, title: 'Geyser & Power Backup', desc: 'Continuous hot water supply and 100% electricity backup generator to tackle outages.' },
  { icon: Radio, title: 'Lounge & Games', desc: 'Recreational space featuring Smart TVs, Netflix, PlayStation, Table Tennis, and Foosball.' }
];

const AMITY_REVIEWS = [
  {
    name: 'Saurav Rawat',
    role: 'Software Engineer, Sector 62',
    text: 'Moving to Noida from Bangalore was stressful until I found Royal PG. The amenities are premium, the Wi-Fi is super fast, and the staff treats you like family. Absolutely worth the price!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Kritika Sharma',
    role: 'Student, Amity University',
    text: 'The Sector 126 branch is right opposite my campus and is exceptionally secure. The biometric entry and girls-only security staff make my parents feel completely safe. Food is highly hygienic!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    name: 'Aditya Sen',
    role: 'Tech Consultant, Candor TechSpace',
    text: 'I rent a single AC room in the Sector 135 co-living branch. The weekly laundry, housekeeping, and gym access save me hours. The community events are an awesome bonus!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

const GALLERY_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80', label: 'Premium Single Suite' },
  { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=500&q=80', label: 'Executive Double Room' },
  { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=500&q=80', label: 'Cozy Shared Lounge' },
  { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=500&q=80', label: 'Luxury Dining Area' },
  { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=500&q=80', label: 'High-End Study Tables' },
  { url: 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?auto=format&fit=crop&w=500&q=80', label: 'In-House Fitness Gym' }
];

export default function HomeLanding() {
  const [formState, setFormState] = useState({ name: '', phone: '', query: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.phone) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormState({ name: '', phone: '', query: '' });
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      
      {/* Background Decorative Gold Glows */}
      <div className="absolute top-20 right-[10%] w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[5%] w-[350px] h-[350px] rounded-full bg-gold-500/5 blur-[100px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-semibold tracking-wider uppercase animate-pulse-slow">
                <Star className="h-3 w-3 fill-gold-500" /> Premium Co-Living Noida
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-foreground leading-[1.1]">
                Redefining Luxury <br />
                <span className="text-gold-500 text-gold-gradient">PG Accommodation</span> <br />
                in Noida, India
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Step into a world of comfort and elegance. Royal PG offers state-of-the-art single and shared luxury suites in prime locations across Noida (Sector 62, 126, and 135) with chef-prepared meals, daily housekeeping, 3-tier security, and a vibrant community.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link
                  href="/rooms"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-medium px-8 py-3.5 rounded-xl shadow-lg shadow-gold-500/15 hover:shadow-gold-500/30 transition-all duration-300 hover:translate-x-0.5 active:scale-98"
                >
                  Book Luxury Room <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <a
                  href="#map-section"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-border bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800/20 font-medium px-6 py-3.5 rounded-xl transition-all duration-300"
                >
                  <MapPin className="h-4 w-4 text-gold-500" /> Visit Branches
                </a>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0 border-t border-border/80 mt-6">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gold-500">300+</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Tenants</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gold-500">3+</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prime Branches</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gold-500">4.9★</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Google Rating</div>
                </div>
              </div>
            </div>

            {/* Right Column Image Carousel / Collage */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[400px] h-[450px]">
                {/* Main Image */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-gold-500/20 shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500 z-10 bg-neutral-800">
                  <img 
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" 
                    alt="Royal PG Room Interior"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-xs font-semibold bg-gold-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">Premium Single AC</span>
                    <h3 className="text-lg font-serif font-bold mt-2">Executive Luxury Suite</h3>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 glass border border-gold-500/30 p-4 rounded-xl shadow-xl z-20 flex items-center gap-3 animate-float max-w-[200px]">
                  <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Top Rated Co-Living</h4>
                    <p className="text-[10px] text-muted-foreground">Best PG in Delhi NCR</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">World-Class Conveniences</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Amenities Engineered For Comfort
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We provide a full-spectrum hospitality experience so you can focus on your studies and work. Every corner is designed to feel like home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FACILITIES.map((facility, i) => {
              const Icon = facility.icon;
              return (
                <div 
                  key={i} 
                  className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center mb-5 group-hover:bg-gold-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-gold-500 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {facility.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Video/Image Collage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-md h-48">
                  <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=350&q=80" alt="Lounge" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-md h-64">
                  <img src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=350&q=80" alt="Shared room" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-xl overflow-hidden shadow-md h-64">
                  <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=350&q=80" alt="Dining room" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-md h-48">
                  <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=350&q=80" alt="Kitchen" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right text details */}
            <div className="space-y-6">
              <div className="text-gold-500 font-semibold text-xs uppercase tracking-wider">Luxury Heritage</div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
                Premier Managed Accommodations Engineered for Noida Nobles
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Noida attracts top-tier corporate talent and students from prestigious institutes. Finding a safe, luxurious, and hassle-free place to stay shouldn&apos;t be a compromise. At Royal PG, we merge the comforts of home with 5-star hotel services.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our properties undergo strict safety and audits by the Noida Municipal Authority. We feature dedicated security monitors, regular fire safety compliance, hygienic kitchens, and common rooms, promoting an interactive community environment.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Chef-managed professional hygienic dining rooms.',
                  'Hassle-free online tenant booking and digital rent collections.',
                  'Dedicated prompt maintenance team responding within 2 hours.'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                    <CheckCircle className="h-4.5 w-4.5 text-gold-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href="/rooms"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold-500 hover:text-gold-600 group transition-colors"
                >
                  Explore Room Rates & Types <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Visual Tour</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Explore Our Luxury Spaces
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A gallery of our real room suites, fitness gym, lounge zones, and dining tables located in Noida.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_PHOTOS.map((photo, i) => (
              <div 
                key={i} 
                className="group relative rounded-2xl overflow-hidden border border-border shadow-sm aspect-video cursor-pointer"
              >
                <img 
                  src={photo.url} 
                  alt={photo.label} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-sm font-semibold font-serif">{photo.label}</h4>
                  <span className="text-[10px] text-gold-300 font-medium uppercase tracking-wider">Noida Branch</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map-section" className="py-20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Prime Locations</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Find Us Near You in Noida
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We are strategically located near tech parks, universities, and metro stations for ultimate convenience.
            </p>
          </div>

          <MapCard />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/20 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Tenant Stories</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              What Our Tenants Say
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Read authentic feedback from working professionals and students currently staying at Royal PG Noida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {AMITY_REVIEWS.map((review, i) => (
              <div 
                key={i} 
                className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-0.5 text-gold-500 mb-4">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-gold-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/40">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-gold-500/20">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">{review.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Form & Call to Action */}
      <section className="py-20 bg-neutral-900 text-white relative">
        <div className="absolute inset-0 bg-gold-500/[0.02] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left text column */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Secure Your Premium Room in Noida Today
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Rooms fill up fast during university admissions and corporate intakes. Fill out this quick form or connect with our suzerain manager immediately for a fast walk-through or booking.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center shrink-0">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Immediate Booking Line</div>
                    <div className="text-sm font-semibold text-white">+91 99999 11111</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Booking Protection</div>
                    <div className="text-xs text-neutral-300">100% Refundable Token Fees if you change your mind within 48 Hours.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form column */}
            <div className="lg:col-span-6 bg-neutral-800 border border-neutral-700/80 p-6 sm:p-8 rounded-2xl shadow-xl">
              <h3 className="text-lg font-serif font-semibold text-white mb-4">Request a Callback / Walkthrough</h3>
              
              {submitted ? (
                <div className="bg-gold-500/10 border border-gold-500/20 text-gold-400 p-6 rounded-xl text-center space-y-2 animate-in fade-in">
                  <CheckCircle className="h-10 w-10 mx-auto text-gold-500" />
                  <h4 className="font-semibold text-sm">Callback Requested!</h4>
                  <p className="text-xs text-neutral-400">Our representative will call you in Noida within 15 minutes.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Your Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Contact Mobile Number *</label>
                    <input 
                      type="tel" 
                      required
                      pattern="[0-9]{10}"
                      placeholder="e.g. 9876543210"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">Custom Message / Branch Choice (Optional)</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Interested in Sector 126 double sharing for girls"
                      value={formState.query}
                      onChange={(e) => setFormState({ ...formState, query: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-xl shadow-md transition-colors text-xs active:scale-98"
                  >
                    Submit Booking Request
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
