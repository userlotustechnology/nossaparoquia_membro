import { createContext } from 'react';
import type { AuthState } from '../types';

export interface AuthContextData extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    device_name?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  /** Recarrega o utilizador a partir de `GET /auth/me` (ex.: após atualizar perfil). */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
