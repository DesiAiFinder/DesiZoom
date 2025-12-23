import { useState, useCallback } from 'react';
import { config } from '../config/env';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simple password check (in production, this should be more secure)
      if (password === config.admin.password) {
        setIsAuthenticated(true);
        // Store auth state in sessionStorage
        sessionStorage.setItem('admin_authenticated', 'true');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  }, []);

  const checkAuth = useCallback(() => {
    const stored = sessionStorage.getItem('admin_authenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return {
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };
};
