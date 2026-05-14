import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ttrpgApi } from '../lib/ttrpg-api';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: string;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('currentUser');
    const storedIsAdmin = localStorage.getItem('isAdmin');

    if (storedUser) {
      setCurrentUser(storedUser);
      setIsAdmin(storedIsAdmin === 'true');
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await ttrpgApi.login(username, password);

    if (response.error) {
      throw new Error(response.error);
    }

    setCurrentUser(response.username || '');
    setIsAdmin(response.isAdmin || false);
    setIsLoggedIn(true);

    // Persist to localStorage
    localStorage.setItem('currentUser', response.username || '');
    localStorage.setItem('isAdmin', String(response.isAdmin || false));
  };

  const register = async (username: string, password: string) => {
    const response = await ttrpgApi.register(username, password);

    if (response.error) {
      throw new Error(response.error);
    }

    setCurrentUser(response.username || '');
    setIsAdmin(false);
    setIsLoggedIn(true);

    // Persist to localStorage
    localStorage.setItem('currentUser', response.username || '');
    localStorage.setItem('isAdmin', 'false');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, isAdmin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
