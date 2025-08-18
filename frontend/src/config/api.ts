// API 설정 파일
interface ApiConfig {
  baseUrl: string;
  imageHostUrl: string;
}

// 개발 환경 설정
const developmentConfig: ApiConfig = {
  baseUrl: 'http://localhost:8000',
  imageHostUrl: 'http://localhost:8000/v1/imagehost'
};

// 프로덕션 환경 설정 (도메인 설정 후 변경)
const productionConfig: ApiConfig = {
  baseUrl: 'https://your-domain.com', // 실제 도메인으로 변경
  imageHostUrl: 'https://your-domain.com/imagehost'
};

// 환경에 따른 설정 선택
const config: ApiConfig = process.env.NODE_ENV === 'production'
  ? productionConfig
  : developmentConfig;

export default config;
