# Stores 폴더 아키텍처 가이드

## 📋 개요

`frontend/src/stores/` 폴더는 **전역 상태 관리**를 담당하는 핵심 디렉토리입니다.

## 🎯 목적과 용도

### 1. **전역 상태 관리**
- 애플리케이션 전체에서 공유되는 상태를 중앙 집중식으로 관리
- 컴포넌트 간 데이터 공유 및 동기화
- 상태 변경 시 자동 UI 업데이트

### 2. **비즈니스 로직 분리**
- UI 컴포넌트에서 비즈니스 로직 분리
- 재사용 가능한 상태 관리 로직
- 테스트 가능한 순수 함수들

### 3. **데이터 흐름 제어**
- 단방향 데이터 흐름 (Unidirectional Data Flow)
- 예측 가능한 상태 변경
- 디버깅 및 개발자 도구 지원

## 🏗 현재 구조

```
frontend/src/stores/
└── auth.atom.ts          # 인증 관련 상태 관리
```

### `auth.atom.ts` 분석
- **Jotai 기반** 상태 관리
- **Atom 패턴** 사용
- **비동기 액션** 지원

## 🔄 Jotai vs Redux 비교

### Jotai (현재 사용)
```typescript
// ✅ 장점
- 간단한 API
- TypeScript 친화적
- 번들 크기 작음
- 성능 최적화 자동
- 컴포넌트별 구독 가능

// ❌ 단점
- 생태계가 상대적으로 작음
- 복잡한 미들웨어 지원 제한
```

### Redux (대안)
```typescript
// ✅ 장점
- 성숙한 생태계
- 강력한 미들웨어 (Redux-Saga, Redux-Thunk)
- 시간 여행 디버깅
- 예측 가능한 상태 업데이트

// ❌ 단점
- 보일러플레이트 코드 많음
- 학습 곡선 가파름
- 번들 크기 큼
```

## 📁 권장 폴더 구조

### Option 1: stores 폴더 사용 (현재 방식)
```
frontend/src/stores/
├── auth.atom.ts              # 인증 상태
├── user.atom.ts              # 사용자 정보
├── product.atom.ts           # 상품 관리
├── admin.atom.ts             # 관리자 상태
├── ui.atom.ts                # UI 상태 (모달, 토스트 등)
└── index.ts                  # 통합 export
```

### Option 2: atoms 폴더 사용 (대안)
```
frontend/src/atoms/
├── auth.atom.ts
├── user.atom.ts
├── product.atom.ts
├── admin.atom.ts
├── ui.atom.ts
└── index.ts
```

## 🎨 현재 프로젝트 권장사항

### **stores 폴더 유지 권장** ✅

**이유:**
1. **명확한 역할**: "stores"는 상태 저장소임을 명확히 표현
2. **확장성**: 향후 Redux로 마이그레이션 시에도 자연스러움
3. **일관성**: 기존 프로젝트 구조와 일치
4. **직관성**: 개발자가 이해하기 쉬운 네이밍

### 개선된 구조 제안
```
frontend/src/stores/
├── auth/                     # 인증 관련
│   ├── auth.atom.ts
│   ├── auth.actions.ts
│   └── auth.types.ts
├── user/                     # 사용자 관리
│   ├── user.atom.ts
│   ├── user.actions.ts
│   └── user.types.ts
├── product/                  # 상품 관리
│   ├── product.atom.ts
│   ├── product.actions.ts
│   └── product.types.ts
├── admin/                    # 관리자 기능
│   ├── admin.atom.ts
│   ├── admin.actions.ts
│   └── admin.types.ts
├── ui/                       # UI 상태
│   ├── ui.atom.ts
│   ├── modal.atom.ts
│   └── toast.atom.ts
└── index.ts                  # 통합 export
```

## 🔧 구현 예시

### 기본 Atom 패턴
```typescript
// stores/auth/auth.atom.ts
import { atom } from 'jotai';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
);
```

### 비동기 액션 Atom
```typescript
// stores/auth/auth.actions.ts
import { atom } from 'jotai';
import { authApi } from '@/apis/authApi';

export const loginAtom = atom(
  null,
  async (get, set, credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    set(userAtom, response.user);
    return response;
  }
);
```

### 파생 Atom
```typescript
// stores/auth/auth.derived.ts
import { atom } from 'jotai';

export const userRoleAtom = atom(
  (get) => get(userAtom)?.roles || []
);

export const isAdminAtom = atom(
  (get) => get(userRoleAtom).includes('admin')
);
```

## 📊 성능 최적화

### 1. **Atom 분할**
```typescript
// ❌ 비효율적
const userStateAtom = atom({
  user: null,
  isLoading: false,
  error: null
});

// ✅ 효율적
const userAtom = atom<User | null>(null);
const isLoadingAtom = atom(false);
const errorAtom = atom<string | null>(null);
```

### 2. **선택적 구독**
```typescript
// 컴포넌트에서 필요한 부분만 구독
const user = useAtomValue(userAtom);
const isLoading = useAtomValue(isLoadingAtom);
```

### 3. **메모이제이션**
```typescript
const expensiveComputationAtom = atom(
  (get) => {
    const user = get(userAtom);
    return expensiveComputation(user);
  }
);
```

## 🧪 테스트 전략

### 1. **Atom 단위 테스트**
```typescript
import { createStore } from 'jotai';
import { userAtom } from './auth.atom';

test('userAtom should update correctly', () => {
  const store = createStore();
  store.set(userAtom, mockUser);
  expect(store.get(userAtom)).toEqual(mockUser);
});
```

### 2. **액션 테스트**
```typescript
test('loginAtom should handle login', async () => {
  const store = createStore();
  await store.set(loginAtom, mockCredentials);
  expect(store.get(userAtom)).toBeDefined();
});
```

## 🚀 마이그레이션 가이드

### Redux에서 Jotai로
1. **Action → Atom**: 액션을 atom으로 변환
2. **Reducer → Derived Atom**: 리듀서를 파생 atom으로 변환
3. **Selector → Atom**: 셀렉터를 atom으로 변환

### Jotai에서 Redux로
1. **Atom → State**: atom을 state로 변환
2. **Action Atom → Action**: 액션 atom을 액션으로 변환
3. **Derived Atom → Selector**: 파생 atom을 셀렉터로 변환

## 📈 모니터링

### 1. **개발자 도구**
- Jotai DevTools 사용
- Atom 상태 추적
- 성능 프로파일링

### 2. **로깅**
```typescript
const loggedAtom = atom(
  (get) => get(userAtom),
  (get, set, newValue) => {
    console.log('User updated:', newValue);
    set(userAtom, newValue);
  }
);
```

## 🎯 결론

**현재 프로젝트에서는 `stores` 폴더를 유지하는 것을 권장합니다.**

**이유:**
1. 명확한 역할과 목적
2. 기존 구조와의 일관성
3. 향후 확장성
4. 개발자 친화적 네이밍

**개선 방향:**
1. 기능별 하위 폴더 구조 도입
2. 타입과 액션 분리
3. 성능 최적화 적용
4. 테스트 코드 작성
