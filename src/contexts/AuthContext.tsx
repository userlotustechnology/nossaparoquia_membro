import { useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../lib/api';
import type { User } from '../types';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const persist = useCallback((userData: User, tokenValue: string) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('auth_token', tokenValue);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  }, []);

  const clear = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      try {
        const response = await api.get<{ success: boolean; data: User }>('/auth/me');
        setUser(response.data.data);
        localStorage.setItem('auth_user', JSON.stringify(response.data.data));
      } catch {
        clear();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [clear]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post<{
        success: boolean;
        data: { user: User; token: string; token_type: string };
      }>('/auth/login', { email, password, device_name: 'membro-web' });
      const { user: userData, token: tokenValue } = response.data.data;
      persist(userData, tokenValue);
    },
    [persist],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const response = await api.post<{
        success: boolean;
        data: { user: User; token: string; token_type: string };
      }>('/auth/google', { credential, device_name: 'membro-web' });
      const { user: userData, token: tokenValue } = response.data.data;
      persist(userData, tokenValue);
    },
    [persist],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      password_confirmation: string,
      device_name = 'membro-web',
    ) => {
      const response = await api.post<{
        success: boolean;
        data: { user: User; token: string; token_type: string };
      }>('/auth/register', { name, email, password, password_confirmation, device_name });
      const { user: userData, token: tokenValue } = response.data.data;
      persist(userData, tokenValue);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silently ignore logout API errors
    } finally {
      clear();
    }
  }, [clear]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
