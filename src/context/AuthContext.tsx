'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  aadhaar?: string;
  role: 'admin' | 'tenant';
  joinedDate?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  otpSent: boolean;
  sendOTP: (phone: string) => Promise<{ success: boolean; message: string }>; // Legacy compatibility
  verifyOTP: (code: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (profile: Omit<UserProfile, 'uid'>, password?: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, code: string, passwordString: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'royal_pg_current_user_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  // Pending signup variables
  const [pendingProfile, setPendingProfile] = useState<Omit<UserProfile, 'uid'> | null>(null);

  // Initialize Auth State from HTTP-only Cookie Session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
            return;
          }
        }
      } catch (err) {
        console.error("Auth session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Send OTP (Legacy wrapper - now handled inside signup or forgot password endpoint)
  const sendOTP = async (phone: string) => {
    // Return mock success as verification is now email-based during the signup/forgot process
    return { success: true, message: `OTP triggered successfully.` };
  };

  // Verify OTP for new registrations
  const verifyOTP = async (code: string) => {
    const email = pendingProfile?.email || localStorage.getItem('otpEmail');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.user) {
        setUser(data.user);
        setOtpSent(false);
        setPendingProfile(null);
        localStorage.removeItem('otpEmail');
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'OTP verification failed.' };
      }

    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Verification failed.' };
    }
  };
  // Sign In with Mobile Number or Email + Password
  const loginWithEmail = async (emailOrPhone: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: emailOrPhone, password })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Sign in failed.' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Authentication error.' };
    }
  };

  // Sign Up (Triggers email verification OTP)
  const signUp = async (profileData: Omit<UserProfile, 'uid'>, password?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          aadhaar: profileData.aadhaar,
          password: password,
          role: profileData.role
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setPendingProfile(profileData);
        setOtpSent(true);
        localStorage.setItem('otpEmail', profileData.email);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Registration failed.' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Network error occurred during signup.' };
    }
  };

  // Forgot Password (Sends verification code)
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setPendingProfile({ name: 'Forgot Password Request', email, phone: '', role: 'tenant' });
        setOtpSent(true);
        localStorage.setItem('otpEmail', email);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to initiate password reset.' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Forgot password request failed.' };
    }
  };

  // Reset Password using OTP
  const resetPassword = async (email: string, code: string, passwordString: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: passwordString })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setOtpSent(false);
        setPendingProfile(null);
        localStorage.removeItem('otpEmail');
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Reset failed.' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Password reset failed.' };
    }
  };

  // Logout Session
  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
      setOtpSent(false);
      setPendingProfile(null);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    setLoading(true);
    try {
      if (!user) throw new Error('No user logged in');

      // Hit /api/tenants endpoint to sync update if it's a resident profile
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.uid, ...profileData })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const updated = { ...user, ...profileData };
        setUser(updated);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        return { success: false, message: data.message || 'Profile update sync failed.' };
      }
    } catch (err: any) {
      setLoading(false);
      return { success: false, message: err.message || 'Profile update failed.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      otpSent,
      sendOTP,
      verifyOTP,
      loginWithEmail,
      signUp,
      forgotPassword,
      resetPassword,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
