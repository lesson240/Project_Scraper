// path: frontend/jest.config.js

module.exports = {
    // 테스트 환경 설정
    testEnvironment: 'jsdom',
    
    // 테스트 파일 패턴
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    
    // 테스트 파일 제외 패턴
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/'
    ],
    
    // 모듈 파일 확장자
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    
    // 모듈 이름 매핑 (절대 경로)
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/apis/(.*)$': '<rootDir>/src/apis/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
        // CSS 및 파일 모킹
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/mocks/fileMock.js'
    },
    
    // 변환 설정
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
        '^.+\\.css$': '<rootDir>/src/tests/mocks/cssMock.js',
        '^.+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/src/tests/mocks/fileMock.js'
    },
    
    // 변환 제외 패턴
    transformIgnorePatterns: [
        '/node_modules/(?!(@babel|@testing-library)/)'
    ],
    
    // 테스트 설정 파일
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    
    // 테스트 타임아웃 (30초)
    testTimeout: 30000,
    
    // 수집할 커버리지 정보
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/serviceWorker.ts',
        '!src/reportWebVitals.ts'
    ],
    
    // 커버리지 임계값
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    
    // 테스트 결과 표시 설정
    verbose: true,
    
    // 테스트 실행 시 콘솔 출력 허용
    silent: false,
    
    // 글로벌 설정
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }
};
