import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  switchTestRole: (role: Role) => void;
  updateUserWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('license_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-sync or authenticate on startup
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('license_auth_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            setToken(storedToken);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Stored token invalid or expired. Refreshing demo persona session.');
          localStorage.removeItem('license_auth_token');
        }
      }

      // Automatically authenticate as default demo persona (Publisher) so valid JWT is present
      try {
        const res = await api.login({ email: 'publisher@cybershield.io', password: 'Password123!' });
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('license_auth_token', res.token);
        if (res.user?.walletAddress) {
          localStorage.setItem('connected_wallet_address', res.user.walletAddress);
          window.dispatchEvent(new Event('persona_wallet_changed'));
        }
      } catch (err) {
        console.warn('Initial demo login fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('license_auth_token', res.token);
      if (res.user?.walletAddress) {
        localStorage.setItem('connected_wallet_address', res.user.walletAddress);
        window.dispatchEvent(new Event('persona_wallet_changed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(userData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('license_auth_token', res.token);
      if (res.user?.walletAddress) {
        localStorage.setItem('connected_wallet_address', res.user.walletAddress);
        window.dispatchEvent(new Event('persona_wallet_changed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('license_auth_token');
  };

  // Real Persona switcher for academic evaluation demo: Authenticates and fetches real JWT
  const switchTestRole = async (role: Role) => {
    let email = 'publisher@cybershield.io';
    if (role === 'CUSTOMER') email = 'customer@enterprise.com';
    else if (role === 'ADMIN') email = 'admin@licensechain.org';

    try {
      setIsLoading(true);
      const res = await api.login({ email, password: 'Password123!' });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('license_auth_token', res.token);
      if (res.user?.walletAddress) {
        localStorage.setItem('connected_wallet_address', res.user.walletAddress);
        window.dispatchEvent(new Event('persona_wallet_changed'));
      }
    } catch (err) {
      console.error('Failed to authenticate test persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserWallet = async (walletAddress: string) => {
    if (user) {
      setUser({ ...user, walletAddress });
    }
    if (token) {
      try {
        await api.updateWallet(walletAddress);
      } catch (err) {
        console.warn('Backend wallet update error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchTestRole,
        updateUserWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
