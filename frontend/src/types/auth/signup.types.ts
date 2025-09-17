// path: frontend/src/types/auth/signup.types.ts

export interface SignupFormData {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessRegistration: string;
  businessOpenningDate: string;
  phone: string;
  termsAgreement: boolean;
  privacyAgreement: boolean;
  marketingAgreement?: boolean;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  verificationRequired?: boolean;
}

export interface SignupValidationErrors {
  id?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  businessName?: string;
  businessRegistration?: string;
  businessOpenningDate?: string;
  phone?: string;
  termsAgreement?: string;
  privacyAgreement?: string;
  general?: string;
}

export interface SignupStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface TermsAgreementData {
  termsAgreement: boolean;
  privacyAgreement: boolean;
  marketingAgreement: boolean;
}

export interface TermsAgreementProps {
  data: TermsAgreementData;
  onChange: (data: TermsAgreementData) => void;
  errors?: Partial<TermsAgreementData>;
}
