// src/utils/validationUtils.ts

/**
 * 이메일 유효성 검사 (도메인 포함)
 * @param email 이메일 주소
 * @returns 유효한 이메일인지 여부
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.length === 0) return false;
  
  // @ 포함 여부 확인
  if (!email.includes('@')) return false;
  
  // @ 앞뒤로 문자가 있는지 확인
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  if (parts[0].length === 0 || parts[1].length === 0) return false;
  
  // 유효한 도메인 확장자 확인
  const validDomains = [
    '.com', '.co.kr', '.net', '.org', '.edu', '.gov', 
    '.kr', '.us', '.uk', '.jp', '.cn', '.de', '.fr',
    '.io', '.me', '.co', '.ac.kr', '.go.kr', '.mil.kr'
  ];
  
  const domain = parts[1].toLowerCase();
  return validDomains.some(validDomain => domain.endsWith(validDomain));
};

/**
 * 비밀번호 강도 검사
 * @param password 비밀번호
 * @returns 강도 점수 (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return strength;
};

/**
 * 전화번호 유효성 검사
 * @param phone 전화번호
 * @returns 유효한 전화번호인지 여부
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 사업자등록번호 유효성 검사
 * @param businessNumber 사업자등록번호
 * @returns 유효한 사업자등록번호인지 여부
 */
export const isValidBusinessNumber = (businessNumber: string): boolean => {
  if (businessNumber.length !== 10) return false;
  
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
  const checkDigit = parseInt(businessNumber[9]);
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(businessNumber[i]) * weights[i];
  }
  
  const remainder = sum % 10;
  const calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;
  
  return calculatedCheckDigit === checkDigit;
};
