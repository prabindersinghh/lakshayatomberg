import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Profile, UserRole } from '@/types';
import { MOCK_USERS, DEMO_CREDENTIALS } from '@/lib/mockData';

interface AuthContextValue {
  user: Profile | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<Profile | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  login: async () => null,
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = sessionStorage.getItem('lakshya_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<Profile | null> => {
    const cred = DEMO_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );
    if (!cred) return null;

    const profile = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!profile) return null;

    setUser(profile);
    sessionStorage.setItem('lakshya_user', JSON.stringify(profile));
    return profile;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('lakshya_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
