// path: frontend/src/types/env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_APP_TITLE: string;
    // 다른 환경변수들도 여기에 추가할 수 있습니다
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
