# 데이터베이스 설계 및 관리

## 🗄 데이터베이스 개요

### MongoDB 클러스터 구성
- **Primary**: 메인 데이터베이스
- **Secondary**: 읽기 전용 복제본
- **Arbiter**: 선거 참여 노드

### 샤딩 전략
- **수평 샤딩**: 사용자 ID 기반
- **수직 샤딩**: 기능별 컬렉션 분리

## 📊 컬렉션 설계

### users 컬렉션 (그룹화 스키마)
```javascript
{
  _id: ObjectId,
  
  basic_info: {
    email: String,          // 직접가입 필수(UNIQUE, partial)
    password: String|null   // 직접가입 해시, 소셜은 null
  },
  
  business_info: {
    business_name: String,
    representative: String,
    business_registration: String, // UNIQUE
    business_opening_date: String  // YYYY-MM-DD
  },
  
  additional_info: {
    phone: String,
    referral_code: String|null
  },
  
  agreement_info: {
    terms_agreement: Boolean,
    privacy_agreement: Boolean,
    marketing_agreement: Boolean
  },
  
  status_info: {
    account_status: String, // 'active' | 'inactive' | 'suspended'
    plan_type: String,      // 'free' | 'paid' | 'manager' | 'admin'
    created_at: Date,
    updated_at: Date,
    last_login_at: Date|null
  },
  
  social_account: {
    provider: String,
    provider_id: String,    // UNIQUE 복합 인덱스(provider+provider_id)
    email: String|null,
    name: String|null,
    profile_image: String|null,
    connected_at: Date
  }|null,
  
  auth_identity: {
    login_type: String,     // 'email' | 'social'
    primary_id: String|null,
    composite_id: String|null,
    account_hash: String    // sha256(primary_id or provider:provider_id)
  }
}
```

### products 컬렉션
```javascript
{
  _id: ObjectId,
  originGoodsCode: String, // 원본 상품 코드
  platform: String, // 'coupang', 'naver', '11st' 등
  title: String,
  description: String,
  price: Number,
  images: [String],
  category: String,
  tags: [String],
  
  // 가격 설정 정보
  priceSettings: {
    basePrice: Number,
    marginRate: Number,
    sellingPrice: Number,
    lastUpdated: Date
  },
  
  // 메타데이터
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId, // 사용자 ID
  status: String // 'active', 'inactive', 'deleted'
}
```

### price_settings 컬렉션
```javascript
{
  _id: ObjectId,
  originGoodsCode: String,
  userId: ObjectId,
  
  // 환율 정보
  exchangeRates: [{
    currencyCode: String,
    appliedRate: Number,
    lastUpdated: Date,
    source: String
  }],
  
  // 판매가 공식 설정
  sellingPriceFormula: {
    baseMarginRate: Number,
    additionalMargin: Number,
    baseShippingFee: Number,
    returnShippingFee: Number,
    exchangeShippingFee: Number,
    internationalShippingFee: Number,
    freeShipping: Boolean,
    optimizeShippingFee: Boolean
  },
  
  // 플랫폼별 마진율
  platformMargins: {
    smartstore: Number,
    coupang: Number,
    auction: Number,
    gmarket: Number,
    elevenst: Number,
    openmarket: Number
  },
  
  // 메타데이터
  createdAt: Date,
  updatedAt: Date,
  version: Number // 버전 관리
}
```

## 🔍 인덱스 전략

### 성능 최적화 인덱스
```javascript
// users 컬렉션
db.users.createIndex({ "business_info.business_registration": 1 }, { unique: true })
db.users.createIndex(
  { "basic_info.email": 1 },
  { unique: true, partialFilterExpression: { "basic_info.email": { $exists: true, $ne: null } } }
)
db.users.createIndex(
  { "social_account.provider": 1, "social_account.provider_id": 1 },
  { unique: true, partialFilterExpression: { "social_account": { $exists: true, $ne: null } } }
)
db.users.createIndex({ "status_info.account_status": 1 })
db.users.createIndex({ "status_info.created_at": 1 })
db.users.createIndex({ "status_info.last_login_at": 1 })

// products 컬렉션
db.products.createIndex({ "originGoodsCode": 1 })
db.products.createIndex({ "platform": 1 })
db.products.createIndex({ "createdBy": 1 })
db.products.createIndex({ "status": 1 })
db.products.createIndex({ "createdAt": 1 })

// price_settings 컬렉션
db.price_settings.createIndex({ "originGoodsCode": 1, "userId": 1 })
db.price_settings.createIndex({ "userId": 1 })
db.price_settings.createIndex({ "updatedAt": 1 })
```

### 복합 인덱스
```javascript
// 사용자별 상품 조회 최적화
db.products.createIndex({ "createdBy": 1, "status": 1, "createdAt": -1 })

// 플랫폼별 상품 조회 최적화
db.products.createIndex({ "platform": 1, "status": 1, "updatedAt": -1 })
```

## ⚡ 성능 최적화

### 쿼리 최적화
- **프로젝션**: 필요한 필드만 조회
- **제한**: LIMIT 사용으로 결과 제한
- **정렬**: 인덱스 활용한 정렬

### 캐싱 전략
- **Redis**: 자주 조회되는 데이터 캐싱
- **Application Cache**: 애플리케이션 레벨 캐싱
- **CDN**: 정적 자원 캐싱

## 🔄 데이터 마이그레이션

### 버전 관리
- **스키마 버전**: 컬렉션별 버전 관리
- **마이그레이션 스크립트**: 자동화된 마이그레이션
- **롤백 계획**: 문제 발생 시 롤백

### 백업 전략
- **정기 백업**: 일일/주간 백업
- **증분 백업**: 변경된 데이터만 백업
- **지역별 백업**: 다중 지역 백업

## 📊 모니터링

### 성능 메트릭
- **쿼리 성능**: 느린 쿼리 감지
- **인덱스 사용률**: 인덱스 효율성
- **연결 풀**: 데이터베이스 연결 상태

### 용량 관리
- **디스크 사용량**: 저장 공간 모니터링
- **메모리 사용량**: 캐시 효율성
- **네트워크**: 데이터 전송량

## 🛠 유지보수

### 정기 작업
- **인덱스 최적화**: 사용하지 않는 인덱스 제거
- **통계 업데이트**: 쿼리 최적화 통계
- **압축**: 데이터 압축으로 공간 절약

### 문제 해결
- **느린 쿼리**: 쿼리 프로파일링
- **락 경합**: 동시성 문제 해결
- **메모리 부족**: 리소스 최적화
