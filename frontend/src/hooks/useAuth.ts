// path: frontend/src/hooks/useAuth.ts

import { useAtom } from 'jotai';
import { 
  authAtom, 
  loginAtom, 
  signupAtom, 
  logoutAtom, 
  socialLoginAtom, 
  refreshTokenAtom,
  initializeAuthAtom 
} from '@/stores/auth.atom';
import type { LoginFormData, SignupFormData } from '@/types/auth';

export function useAuth() {
  const [authState] = useAtom(authAtom);
  const [, login] = useAtom(loginAtom);
  const [, signup] = useAtom(signupAtom);
  const [, logout] = useAtom(logoutAtom);
  const [, socialLogin] = useAtom(socialLoginAtom);
  const [, refreshToken] = useAtom(refreshTokenAtom);
  const [, initializeAuth] = useAtom(initializeAuthAtom);

  return {
    // 상태
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // 액션
    login: (credentials: LoginFormData) => login(credentials),
    signup: (userData: SignupFormData) => signup(userData),
    logout: () => logout(),
    socialLogin: (provider: string, code: string) => socialLogin(provider, code),
    refreshToken: () => refreshToken(),
    initializeAuth: () => initializeAuth(),
  };
}
