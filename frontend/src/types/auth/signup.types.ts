// path: frontend/src/types/auth/signup.types.ts

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  representativeName: string;
  businessRegistration: string;
  businessOpeningDate: string;
  phone: string;
  referralCode?: string;
  termsAgreement: boolean;
  privacyAgreement: boolean;
  marketingAgreement?: boolean;
}

// API 전송용 Payload (백엔드 그룹화 스키마와 매핑)
export interface SignupPayload {
  basic_info: {
    email?: string;
    password?: string;
  };
  business_info: {
    business_name: string;
    representative: string;
    business_registration: string;
    business_opening_date: string;
  };
  additional_info: {
    phone: string;
    referral_code?: string;
  };
  agreement_info: {
    terms_agreement: boolean;
    privacy_agreement: boolean;
    marketing_agreement: boolean;
  };
  status_info?: {
    account_status?: 'active' | 'inactive' | 'suspended';
    plan_type?: 'free' | 'paid' | 'manager' | 'admin';
  };
  social_account?: {
    provider: string;
    provider_id: string;
    email?: string;
    name?: string;
    profile_image?: string;
  };
  auth_identity: {
    login_type: 'email' | 'social';
    primary_id?: string;
    composite_id?: string;
    account_hash: string;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  verificationRequired?: boolean;
}

export interface SignupValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  businessName?: string;
  representativeName?: string;
  businessRegistration?: string;
  businessOpeningDate?: string;
  phone?: string;
  referralCode?: string;
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
