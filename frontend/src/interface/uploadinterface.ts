export interface Account {
  id: string;
  label: string;
}

export interface AccountList {
  children: Account[];
  id: string;
  label: string;
}

export interface SearchValue {
  code: string;
  groupName: string;
  memo: string;
  productName: string;
  uploadWorkNumber: number | null | string;
  workNumber: number | null | string;
  endDate: string;
  startDate: string;
  pageNum: number;
  pageLimit: number;
  perPage: number;
  nonUpload: {
    market: string;
    marketAccount: string;
  };
}

export interface UploadSummary {
  code: string;
  collectDate: string;
  editDate: string;
  groupName: string;
  id: string;
  isSetTag: boolean;
  mainImages: string[];
  marketProductDetailInfo: null;
  maximumPrice: Price[];
  memo: string;
  minimumPrice: Price[];
  productUrl: string;
  regDate: string;
  site: string;
  tags: string[] | null;
  title: title[];
  uploadCompleteSummaryInfo: isUploadMarket;
  uploadDate: string;
  viewsCount: number;
  workNumber: number;
}

export interface UploadSummaryData {
  totalPage: number;
  // ...other fields
}

export interface Price {
  currency: string;
  originalPrice: number;
  salePrice: number;
}
interface title {
  language: string;
  text: string;
}
interface isUploadMarket {
  isAuction: boolean;
  isCoupang: boolean;
  isElevenst: boolean;
  isGmarket: boolean;
  isSmartStore: boolean;
  isWeMakePrice: boolean;
}

export interface Keyword {
  compIdx: string;
  monthlyAveMobileClkCnt: number;
  monthlyAveMobileCtr: number;
  monthlyAvePcClkCnt: number;
  monthlyAvePcCtr: number;
  monthlyMobileQcCnt: number;
  monthlyPcQcCnt: number;
  plAvgDepth: number;
  realKeyword: null;
  relKeyword: string;
}

export interface StorePrice {
  coupangRatio: number;
  auctionRatio: number;
  gmarketRatio: number;
  elevenstRatio: number;
  coupangDeliveryFee: number;
  coupangReturnFee: number;
  auctionDeliveryFee: number;
  auctionReturnFee: number;
  gmarketDeliveryFee: number;
  gmarketReturnFee: number;
  elevenstDeliveryFee: number;
  elevenstReturnFee: number;
}

export type StorePriceName =
  | "coupangRatio"
  | "coupangDeliveryFee"
  | "coupangReturnFee"
  | "auctionRatio"
  | "auctionDeliveryFee"
  | "auctionReturnFee"
  | "gmarketRatio"
  | "gmarketDeliveryFee"
  | "gmarketReturnFee"
  | "elevenstRatio"
  | "elevenstDeliveryFee"
  | "elevenstReturnFee";

export interface ProhibitReplaceWord {
  convertWord: string;
  idx: number;
  regDate: string;
  targetWord: string;
  type: string;
}

export type MarketKorean =
  | "쿠팡"
  | "스마트스토어"
  | "옥션"
  | "지마켓"
  | "11번가";
export type MarketEnglish =
  | "Coupang"
  | "SmartStore"
  | "Auction"
  | "Gmarket"
  | "Elevenst";
export type MarketEnglishLower =
  | "coupang"
  | "smartstore"
  | "auction"
  | "gmarket"
  | "elevenst";
export interface CoupangCategory {
  auction?: string;
  auctionName?: string;
  coupang?: string;
  coupangName?: string;
  elevenst?: string;
  elevenstName?: string;
  gmarket?: string;
  gmarketName?: string;
  idx?: number;
  lastDate?: string;
  smartstore?: string;
  smartstoreName?: string;
}
export interface OtherMarket {
  detailName?: null | string;
  id?: number;
  largeName?: string;
  marketFee?: number;
  middleName?: string;
  smallName?: string;
  subdetailName?: null | string;
  subsubdetailName?: null | string;
}

export interface Category {
  Coupang: CoupangCategory | null;
  Auction: OtherMarket | null;
  Gmarket: OtherMarket | null;
  Elevenst: OtherMarket | null;
  SmartStore: OtherMarket | null;
}

export interface CategorySearchKeyword {
  Coupang: string;
  Auction: string;
  Gmarket: string;
  Elevenst: string;
  SmartStore: string;
}

export interface ApplyCategory1 {
  coupang: CoupangCategory | null;
  auction: OtherMarket | null;
  gmarket: OtherMarket | null;
  elevenst: OtherMarket | null;
  smartstore: OtherMarket | null;
}

export type ApplyCategory = ApplyCategory1 | CoupangCategory;

export interface Desc {
  index: number;
  language: string;
  title: string;
  value: string;
}

export interface DefaultInfo {
  Id: string;
  code: string;
  currency: string;
  descs: Desc[];
  detailPageHtml: string;
  groupName: string;
  mainImages: string[];
  memo: string;
  option: any;
  originalDetailPageUrls: string[];
  price: any;
  regDate: string;
  site: string;
  tags: string[];
  title: title[];
  translateDetailPageUrls: null;
  url: string;
  videoUrl: string;
  workNumber: null;
}

export interface UploadLog {
  account: string;
  market: string;
  marketEtcInfo: string;
  marketProductCode: string;
  regDate: string;
  status: string;
  updateDate: string;
  workNumber: number;
}

export interface OptionGroupType {
  groupName: { language: string; text: string }[];
  groups: OptionValueType[];
  id: string;
}

export interface OptionValueType {
  id: string;
  optionImage: string | null;
  optionName: { language: string; text: string }[];
  price: null | Price[];
  quantity: number;
  indexId?: string;
}

export interface DetailOptionType {
  id: string;
  priceIndex?: string;
  isSoldOut: boolean;
  optionGroupName: { language: string; text: string }[];
  optionImage: string | null;
  optionName: { language: string; text: string }[];
  price: { currency: string; originalPrice: number; salePrice: number }[];
  quantity: number;
}

export interface OptionName {
  language: string;
  text: string;
}

export interface CustomRates {
  applyDate: string;
  data: CustomRateItem[];
}

export interface CustomRateItem {
  aplyBgnDt: string;
  cntySgn: string;
  currSgn: string;
  fxrt: string;
  imexTp: string;
  mtryUtNm: string;
}

export interface MarketPrice {
  market: "Coupang" | "Auction" | "Gmarket" | "Elevenst";
  addRatio: number;
  deliveryBaiscPrice: number;
  deliveryExchangePrice: number;
  deliveryReturnPrice: number;
}

export interface PriceType {
  mainValue: number;
  subValue: number;
  deliveryBasicPrice: number;
  deliveryExchangePrice: number;
  deliveryReturnPrice: number;
  Coupang: number;
  Auction: number;
  Gmarket: number;
  Elevenst: number;
}

export interface ExpectListType {
  currency: "USD" | "CNY" | "KRW" | "WON";
  thumbnail: string;
  productName: string;
  defaultPrice: {
    min: number;
    max: number;
  };
  settingPrice: {
    min: number;
    max: number;
  };
  expectMarinRate: number;
  expectMargin: {
    min: number;
    max: number;
  };
}
