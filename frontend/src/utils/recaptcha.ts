// path: frontend/src/utils/recaptcha.ts

/**
 * reCAPTCHA v3 유틸리티
 */

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export interface RecaptchaConfig {
  siteKey: string;
  action: string;
}

export class RecaptchaService {
  private static instance: RecaptchaService;
  private isLoaded = false;
  private siteKey: string;
  private isEnabled: boolean;

  constructor() {
    this.siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    this.isEnabled = !!this.siteKey;
  }

  static getInstance(): RecaptchaService {
    if (!RecaptchaService.instance) {
      RecaptchaService.instance = new RecaptchaService();
    }
    return RecaptchaService.instance;
  }

  /**
   * reCAPTCHA 스크립트 로드
   */
  async loadScript(): Promise<void> {
    // 키가 없으면 로딩을 건너뜁니다(개발/로컬 환경 우회).
    if (!this.isEnabled) return;
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      // 이미 스크립트가 로드되어 있는지 확인
      if (window.grecaptcha) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('reCAPTCHA 스크립트 로드 실패'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * reCAPTCHA 토큰 생성
   */
  async execute(action: string): Promise<string> {
    // 키가 없으면 개발 편의를 위해 우회 토큰 반환
    if (!this.isEnabled) {
      if (import.meta.env.DEV) {
        console.warn('[reCAPTCHA] site key 미설정 - 개발 모드에서 우회합니다.');
        return 'recaptcha-dev-bypass';
      }
      // 프로덕션에서 키가 없으면 빈 토큰 반환(백엔드에서 검증 실패 처리)
      return '';
    }

    await this.loadScript();

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(this.siteKey, { action })
          .then((token) => resolve(token))
          .catch((error) => {
            console.warn('[reCAPTCHA] 실행 실패:', error);
            // 실패 시 빈 토큰으로 계속 진행하여 백엔드에서 판단하도록 위임
            resolve('');
          });
      });
    });
  }

  /**
   * 로그인용 reCAPTCHA 토큰 생성
   */
  async executeForLogin(): Promise<string> {
    return this.execute('login');
  }

  /**
   * 회원가입용 reCAPTCHA 토큰 생성
   */
  async executeForSignup(): Promise<string> {
    return this.execute('signup');
  }
}

// 싱글톤 인스턴스 export
export const recaptchaService = RecaptchaService.getInstance();
