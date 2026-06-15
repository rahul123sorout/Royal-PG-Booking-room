'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PGDataProvider, usePGData } from '../context/PGContext';
import { 
  Sun, Moon, Menu, X, LogOut, LayoutDashboard, Bed, Home, 
  MapPin, Phone, Mail, Bell, ShieldCheck, Heart, User, Check
} from 'lucide-react';

// Sub-component to access Auth and PG contexts inside Providers
const HeaderAndFooterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { alerts, markAlertAsRead } = usePGData();
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('royal_pg_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('royal_pg_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('royal_pg_theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const activeAlerts = alerts.filter(a => !a.read);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Rooms', href: '/rooms', icon: Bed },
    ...(user ? [{ name: 'Dashboard', href: user.role === 'admin' ? '/dashboard' : '/resident', icon: LayoutDashboard }] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-gold-500 hover:text-gold-600 transition-colors flex items-center">
                  ROYAL<span className="text-foreground ml-1 text-sm font-sans tracking-widest font-normal uppercase hidden sm:inline border-l border-gold-500/30 pl-2">PG</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-gold-500 py-1 border-b-2 ${
                      isActive ? 'border-gold-500 text-gold-500' : 'border-transparent text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground/80 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="h-5 w-5 text-gold-400" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Alerts Center (Only if logged in) */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setAlertsOpen(!alertsOpen)}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground/80 transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    {activeAlerts.length > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                        {activeAlerts.length}
                      </span>
                    )}
                  </button>

                  {/* Alerts Dropdown */}
                  {alertsOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass rounded-lg border border-border shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-border/80 flex items-center justify-between">
                        <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Notifications</span>
                        {activeAlerts.length > 0 && (
                          <span className="text-[10px] bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full font-medium">
                            {activeAlerts.length} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {alerts.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground">No alerts available</div>
                        ) : (
                          alerts.map((alert) => (
                            <div 
                              key={alert.id} 
                              className={`px-4 py-3 border-b border-border/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors flex gap-3 ${
                                !alert.read ? 'bg-gold-500/5' : ''
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold text-foreground">{alert.title}</h4>
                                  <span className="text-[9px] text-muted-foreground">{alert.date}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                                {!alert.read && (
                                  <button
                                    onClick={() => markAlertAsRead(alert.id)}
                                    className="text-[10px] text-gold-500 font-medium hover:underline flex items-center gap-0.5 mt-1"
                                  >
                                    <Check className="h-3 w-3" /> Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Auth Buttons / Profile */}
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-[10px] capitalize text-gold-500 font-medium tracking-wide">
                      {user.role} Account
                    </span>
                  </div>
                  <Link href={user.role === 'admin' ? '/dashboard' : '/resident'} className="p-1 rounded-full border border-gold-500/30 hover:border-gold-500 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-sm tracking-wider uppercase">
                      {user.name.charAt(0)}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500/80 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-1.5 rounded-md transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?tab=signup"
                    className="inline-flex items-center justify-center text-sm font-medium bg-gold-500 hover:bg-gold-600 text-white px-4 py-1.5 rounded-md transition-all shadow-sm shadow-gold-500/10 hover:shadow-gold-500/20 active:scale-95"
                  >
                    Join Royal PG
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/80 glass px-4 py-4 space-y-3 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold-500/15 text-gold-500' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/40 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
            {!user && (
              <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-md text-sm font-medium border border-border text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-md text-sm font-medium bg-gold-500 text-white hover:bg-gold-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold tracking-wider text-gold-500">
                ROYAL PG
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Experience ultra-premium co-living in Noida, India. Fully furnished luxury suites with high-speed internet, premium dining, fitness access, and 5-star hospitality.
              </p>
              <div className="flex items-center gap-2 text-gold-500 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" /> Noida Authority Certified
              </div>
            </div>

            {/* Noida Specific Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Noida Locations</h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0 mt-0.5" />
                  <span>Sector 62, Noida, UP (Near Metro Station & Fortis)</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0 mt-0.5" />
                  <span>Sector 126, Noida, UP (Opposite Amity University)</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0 mt-0.5" />
                  <span>Sector 135, Noida, UP (Near IT SEZ & Cognizant)</span>
                </li>
              </ul>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/" className="hover:text-gold-400 transition-colors">Home Suite</Link></li>
                <li><Link href="/rooms" className="hover:text-gold-400 transition-colors">Browse Rooms</Link></li>
                <li><Link href="/login" className="hover:text-gold-400 transition-colors">Manage Booking</Link></li>
                <li><Link href="/dashboard" className="hover:text-gold-400 transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>

            {/* Contacts Column */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Suzerain</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold-500" />
                  <span>+91 99999 11111 / +91 99999 22222</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold-500" />
                  <span>booking@royalpg.com</span>
                </li>
                <li className="text-[10px] text-neutral-500 leading-relaxed mt-2">
                  Noida Head Office: Block B, Sector 62, Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div>
              &copy; {new Date().getFullYear()} Royal PG India. All rights reserved.
            </div>
            <div className="flex items-center gap-1">
              Crafted for luxury co-living <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in Noida, India.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <PGDataProvider>
        <HeaderAndFooterWrapper>
          {children}
        </HeaderAndFooterWrapper>
      </PGDataProvider>
    </AuthProvider>
  );
};
