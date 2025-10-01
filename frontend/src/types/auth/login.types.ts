// path: frontend/src/types/auth/login.types.ts

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginTabProps {
  activeTab: 'input' | 'find';
  onTabChange: (tab: 'input' | 'find') => void;
}

export interface LoginInputTabProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  error?: string;
}

export interface FindAccountTabProps {
  onFindId: (data: FindIdFormData) => void;
  onFindPassword: (data: FindPasswordFormData) => void;
  isLoading: boolean;
  error?: string;
}

export interface FindIdFormData {
  name: string;
  phone: string;
  birthDate: string;
}

export interface FindPasswordFormData {
  email: string;
  name: string;
  phone: string;
}

export interface FindAccountResponse {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    maskedEmail?: string;
  };
}
