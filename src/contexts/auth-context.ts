import { createContext } from 'react';
import type { AuthState } from '../types';

/** Após email/senha ou Google, o backend pode exigir TOTP/código de backup. */
export type LoginResult =
  | { status: 'success' }
  | { status: 'needs_2fa'; twoFactorToken: string };

export interface AuthContextData extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>;
  loginWithGoogle: (credential: string) => Promise<LoginResult>;
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
  /** Conclui login após `needs_2fa` (código de 6 dígitos ou código de backup). */
  completeTwoFactorLogin: (params: {
    twoFactorToken: string;
    code?: string;
    backupCode?: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
