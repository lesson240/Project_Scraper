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

// 프로덕션 환경 설정 (도메인 연결)
const productionConfig: ApiConfig = {
  baseUrl: 'https://allttam.kr',
  imageHostUrl: 'https://allttam.kr/v1/imagehost'
};

// 환경에 따른 설정 선택
const config: ApiConfig = process.env.NODE_ENV === 'production'
  ? productionConfig
  : developmentConfig;

export default config;
