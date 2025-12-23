import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isAdmin: boolean;
  role: 'admin' | 'service_provider';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 AuthContext: checkAuthStatus called');
    try {
      const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
      const email = localStorage.getItem('admin_email');
      
      if (isAuthenticated && email) {
        // Check if it's admin login
        await import('../config/env');
        if (email === 'admin@test.com') {
          setUser({
            id: 'admin',
            email: email,
            firstName: 'Admin',
            lastName: 'User',
            phone: '',
            isAdmin: true,
            role: 'admin'
          });
        } else {
          // For regular users, fetch from database
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
          
          if (userData && !error) {
            const userRole = userData.role || 'service_provider';
            setUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              phone: userData.phone || '',
              isAdmin: userRole === 'admin',
              role: userRole
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { config } = await import('../config/env');
      
      // Check if it's admin login
      if (email === 'admin@test.com' && password === config.admin.password) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_email', email);
        
        setUser({
          id: 'admin',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          phone: '',
          isAdmin: true,
          role: 'admin'
        });
        
        return true;
      }
      
      // For regular users, check if they exist in database
      // Note: In a real app, you'd use Supabase Auth for password verification
      // For now, we'll just check if the user exists
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userData && !error) {
        // In a real app, you'd verify the password here
        // For now, we'll allow login if user exists
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_email', email);
        
        const userRole = userData.role || 'service_provider';
        setUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          phone: userData.phone || '',
          isAdmin: userRole === 'admin',
          role: userRole
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_email');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
