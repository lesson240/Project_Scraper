export interface ProdcutManageResultItem {
  code: string;
  collectDate: string;
  editDate: string;
  groupName: string;
  id: string;
  isSetTag: boolean;
  mainImages: string[];
  marketProductDetailInfo: { market: string; url: string }[];
  maximumPrice: PriceType[];
  memo: string;
  minimumPrice: PriceType[];
  productUrl: string;
  regDate: string;
  site: string;
  tags: string[];
  title: TitleType[];
  uploadCompleteSummaryInfo: null | string;
  uploadDate: string;
  viewsCount: number;
  workNumber: number;
}

export interface PriceType {
  currency: string;
  originalPrice: number;
  salePrice: number;
}
export interface ProductManageSearchingValue {
  pageLimit: number;
  code: string;
  productName: string;
  memo: string;
  groupName: string;
  uploadWorkNumber: string;
  sort?: boolean;
  startDate?: string;
  endDate?: string;
  viewsCondition?: {
    filter: string;
    count: number;
  };
}

export interface StatusChangeModal {
  title: string;
  message: string;
  button: string;
  status: string;
}

export interface MarketAccount {
  market: string;
  account: {
    accessKey: null | string;
    account: null | string;
    openApiKey: null | string;
    secretKey: null | string;
    storeName: null | string;
    vendorId: null | string;
  };
}

export interface EditProductTitleValueType {
  objectId: string;
  code: string;
  title: string;
}

export interface TitleType {
  language: string;
  text: string;
}

export interface ViewsData {
  series: {
    data: number[];
    name: string;
    showInLegend: boolean;
  }[];
  title: { text: string };
  xAxis: {
    categories: string[];
  };
  yAxis: {
    title: string;
    lineWidth: number;
  };
}
