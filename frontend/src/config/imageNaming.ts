// path: frontend/src/config/imageNaming.ts

export interface ImageNamingRule {
  pattern: string;
  rules: {
    goodsCode: {
      fallback: string;
      maxLength: number;
    };
    imageType: {
      mapping: Record<string, string>;
      default: string;
    };
    dateFormat: string;
    uuidLength: number;
    separator: string;
  };
}

export const IMAGE_NAMING_RULES: ImageNamingRule = {
  pattern: '[상품코드]_[이미지타입]_[날짜]_[UUID8자리].[확장자]',
  rules: {
    goodsCode: {
      fallback: 'unknown',
      maxLength: 20
    },
    imageType: {
      mapping: {
        thumbnail: 'thumbnail',
        detail: 'detail',
        gallery: 'gallery',
        main: 'main',
        sub: 'sub'
      },
      default: 'image'
    },
    dateFormat: 'YYYYMMDD',
    uuidLength: 8,
    separator: '_'
  }
};

// 파일명 생성 유틸리티 함수
export const generateImageFilename = (
  goodsCode: string | null,
  imageType: string,
  originalExtension: string
): string => {
  const { rules } = IMAGE_NAMING_RULES;
  
  // 상품코드 처리
  const safeGoodsCode = goodsCode 
    ? goodsCode.slice(0, rules.goodsCode.maxLength).replace(/[^a-zA-Z0-9]/g, '')
    : rules.goodsCode.fallback;
  
  // 이미지 타입 매핑
  const mappedType = rules.imageType.mapping[imageType.toLowerCase()] || rules.imageType.default;
  
  // 날짜 생성
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // UUID 생성 (8자리)
  const uuid = Math.random().toString(36).substring(2, 10);
  
  // 확장자 정규화
  const extension = originalExtension.toLowerCase().replace(/^\./, '');
  
  return `${safeGoodsCode}${rules.separator}${mappedType}${rules.separator}${currentDate}${rules.separator}${uuid}.${extension}`;
};

// 파일명 파싱 함수
export const parseImageFilename = (filename: string): {
  goodsCode: string;
  imageType: string;
  date: string;
  uuid: string;
  extension: string;
} | null => {
  const { rules } = IMAGE_NAMING_RULES;
  const parts = filename.split(rules.separator);
  
  if (parts.length < 4) return null;
  
  const extension = parts[parts.length - 1].split('.');
  if (extension.length !== 2) return null;
  
  return {
    goodsCode: parts[0],
    imageType: parts[1],
    date: parts[2],
    uuid: parts[3].split('.')[0],
    extension: extension[1]
  };
};

// 파일명 유효성 검사
export const validateImageFilename = (filename: string): boolean => {
  const parsed = parseImageFilename(filename);
  if (!parsed) return false;
  
  // 날짜 형식 검사 (YYYYMMDD)
  const dateRegex = /^\d{8}$/;
  if (!dateRegex.test(parsed.date)) return false;
  
  // UUID 길이 검사
  if (parsed.uuid.length !== IMAGE_NAMING_RULES.rules.uuidLength) return false;
  
  return true;
};
