export type AdminNavState =
  | "user"
  | "notice"
  | "categoryMapping"
  | "categoryMappingAdmin"
  | "banner"
  | "care"
  | "help";

export interface AdminUser {
  auctionLimit: number;
  cafe24Limit: number;
  collectionLimit: number;
  contactTelNo: string;
  coupangLimit: number;
  elevenstLimit: number;
  email: string;
  expireDate: string;
  gmarketLimit: number;
  joinDate: string;
  point: number;
  no: number;
  lastLoginDate: string;
  planName: string;
  smartStoreLimit: number;
  status: boolean;
  userId: string;
  userName: string;
  weMakePriceLimit: number;
  yahooJapanLimit: number;
  isAgreeMarketing: boolean;
}

export interface AdminNotice {
  id: number;
  regDate: string;
  title: string;
  updateDate: string;
  writer: string | null;
}

export interface MappingItem {
  code: number | null;
  detailCode: number | null;
  detailName: string | null;
  id: number | null;
  largeCode: number | null;
  largeName: string | null;
  marketFee: number | null;
  matchIdx: number | null;
  middleCode: number | null;
  middleName: string | null;
  smallCode: number | null;
  smallName: string | null;
  subdetailName: string | null;
  subsubdetailName: string | null;
}

export interface StoreMappingType {
  auction?: string;
  auctionName?: string;
  elevenst?: string;
  elevenstName?: string;
  gmarket?: string;
  gmarketName?: string;
  smartstore?: string;
  smartstoreName?: string;
}

export interface CoupangMappingType {
  coupang: string;
  coupangName: string;
}

export interface MappedCategory {
  auction: string;
  auctionName: string;
  coupang: string;
  coupangName: string;
  elevenst: string;
  elevenstName: string;
  gmarket: string;
  gmarketName: string;
  idx: number;
  lastDate: string;
  smartstore: string;
  smartstoreName: string;
}

export interface DeleteList {
  coupang: string;
}

export type Market =
  | "coupang"
  | "smartstore"
  | "auction"
  | "gmarket"
  | "elevenst";

export interface Consultings {
  _id: string;
  name: string;
  phoneNumber: string;
  coin: number;
  payLog: number;
  memo: string;
  manager: string;
  isComplete: boolean;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}
