import axios from "axios";
import axiosInstance from "../axiosInstance";
import { CoupangMappingType } from "@/interface/admininterface";
import axiosCenter from "../axiosCenter";

export const agree = {
  agree: async (terms: boolean, marketing: boolean) => {
    const res = await axiosInstance.put("/Auth/SetPolicyAgree", {
      isAgreeTerms: terms,
      isAgreeMarketing: marketing,
    });

    return res.data;
  },
};

export const productManage = {
  getViewCount: async (chartType: string, code: string, market: string) => {
    const res = await axiosInstance.post(
      "/ProductManagement/GetProductViewsCount",
      {
        chartType,
        code,
        market,
      }
    );

    return res.data.data;
  },
};

export const adminPage = {
  suspension: async (id: string) => {
    const res = await axiosInstance.post("/AdminPage/SetUserSuspension", id);

    return res.data;
  },

  activate: async (id: string) => {
    const res = await axiosInstance.post("/AdminPage/SetUserResume", id);

    return res.data;
  },

  periodExtends: async (data: { extendDate: string; userId: string }) => {
    const res = await axiosInstance.post(
      "/AdminPage/SetUserPeriodExtends",
      data
    );

    return res.data;
  },

  setUserPermission: async (data: {
    plan: string;
    auctionLimit: number;
    collectionLimt: number;
    coupangLimit: number;
    elevenstLimit: number;
    gmarketLimit: number;
    smartStoreLimit: number;
    point: number;
    userId: string;
  }) => {
    const res = await axiosInstance.post(
      "/AdminPage/Allddam/SetUserPermission",
      data
    );

    return res.data;
  },

  uploadNotice: async (data: {
    title: string;
    contents: string;
    id?: number;
    regDate?: string;
    writer?: string;
  }) => {
    const res = await axiosInstance.post("/AdminPage/SetNotice", data);

    return res.data;
  },

  getNotice: async (id: number) => {
    const res = await axiosInstance.post("/AdminPage/GetNotice", id);

    return res.data;
  },
  deleteNotice: async (data: number) => {
    const res = await axiosInstance.post("AdminPage/RemoveNotice", data);

    return res.data;
  },
  getCoupangCategoryList: async () => {
    const res = await axiosInstance.get(
      "/CategoryMapping/GetCategory?market=Coupang&upper1="
    );

    return res.data;
  },
  getAuctionCategoryList: async () => {
    const res = await axiosInstance.get(
      "/CategoryMapping/GetCategory?market=Auction&upper1="
    );

    return res.data;
  },
  getGmarketCategoryList: async () => {
    const res = await axiosInstance.get(
      "/CategoryMapping/GetCategory?market=Gmarket&upper1="
    );

    return res.data;
  },
  getSmartStoreCategoryList: async () => {
    const res = await axiosInstance.get(
      "/CategoryMapping/GetCategory?market=SmartStore&upper1="
    );

    return res.data;
  },
  getElevenstCategoryList: async () => {
    const res = await axiosInstance.get(
      "/CategoryMapping/GetCategory?market=Elevenst&upper1="
    );

    return res.data;
  },
  mappingCategory: async (data: CoupangMappingType[]) => {
    const res = await axiosInstance.post(
      "/CategoryMapping/UpsertMappingCategory",
      data
    );

    return res.data;
  },
  getMappedCategory: async () => {
    const res = await axiosInstance.get("/CategoryMapping/GetMappingCategory");

    return res.data.data;
  },
  deleteCategory: async (data: { coupang: string }[]) => {
    const res = await axiosInstance.post(
      "/CategoryMapping/DeleteMappingCategory",
      data
    );

    return res.data;
  },
  updateCategory: async (data: {}) => {
    const res = await axiosInstance.post(
      "/CategoryMapping/UpdateCategoryMappingNone",
      data
    );

    return res.data;
  },
  userMemo: async (userId: string, memo: string) => {
    const res = await axiosInstance.post(
      `/AdminPage/Allddam/SetAdminUserMemo?userId=${userId}`,
      memo
    );

    return res.data;
  },
  getTmApi: async () => {
    const res = await axiosCenter.get("/tmapi");

    return res.data;
  },
};

export const upload = {
  getNaverKeyword: async (keyword: string) => {
    const res = await axiosInstance.post("/Market/GetNaverKeyword", keyword);

    return res.data;
  },

  changeOneProductName: async (data: { text: string; code: string }[]) => {
    const res = await axiosInstance.post("/Product/ProductTitleChange", data);

    return res.data;
  },
  changeProductMemo: async (data: { memo: string; objectId: string }) => {
    const res = await axiosInstance.post("/Product/ProductMemoEdit", data);

    return res.data;
  },
  setTag: async (data: { objectIds: string[]; tags: string[] }) => {
    const res = await axiosInstance.post("/Market/SetTags", data);

    return res.data;
  },
  setPrice: async (data: {}) => {
    const res = await axiosInstance.post("/Market/SetPrice", data);

    return res.data;
  },
  setDetailPageSetting: async (data: {}) => {
    const res = await axiosInstance.post("/Market/SetDetailPage", data);

    return res.data;
  },
  setProhibitReplaceWord: async (data: string, type: string) => {
    const res = await axiosInstance.post("/Product/SetCollectFillter", {
      type,
      targetWord: data,
    });

    return res;
  },
  setReplaceWord: async (data: {}) => {
    const res = await axiosInstance.post("/Product/SetCollectFillter", data);

    return res;
  },
  removeProhibitReplaceWord: async (data: number[]) => {
    const res = await axiosInstance.post("/Product/RemoveCollectFillter", data);

    return res.data;
  },
  getProhibitReplaceWord: async (type: string) => {
    const res = await axiosInstance.post("/Product/GetCollectFillter", type);

    return res.data;
  },

  setProductName: async (data: { code: string; text: string }[]) => {
    const res = await axiosInstance.post("/Product/ProductTitleChange", data);

    return res.data;
  },
  deleteProduct: async (data: string[]) => {
    const res = await axiosInstance.post("/Product/RemoveProduct", data);

    return res.data;
  },
  checkCoupangLogin: async (data: {}) => {
    const res = await axiosInstance.post(
      "/MarketInfo/CheckCoupangLoginID",
      data
    );

    return res.data;
  },
  checkElevenstLogin: async (data: {}) => {
    const res = await axiosInstance.post(
      "/MarketInfo/CheckElevenstLoginID",
      data
    );
    return res.data;
  },
  getAutoMappingCategoryId: async (coupangId: number) => {
    const res = await axiosInstance.get(
      `/CategoryMapping/SearchCategoryResponse?idx=${coupangId}`
    );
    return res.data.data[0];
  },
  searchCategoryMapping: async (idx: {
    coupangId?: number;
    auction?: number;
    gmarket?: number;
    smartstore?: number;
    elevenst?: number;
  }) => {
    let returnRes = {
      coupang: null,
      auction: null,
      gmarket: null,
      elevenst: null,
      smartstore: null,
    };

    if (idx.coupangId) {
      const coupangRes = await axiosInstance.get(
        `/CategoryMapping/SearchCategoryResponse?idx=${idx.coupangId}`
      );
      returnRes.coupang = coupangRes.data.data[0];
    }
    if (idx.auction) {
      const auctionRes = await axiosInstance.get(
        `/CategoryMapping/OpenmarketSearchCategoryIdx?marketName=Auction&idx=${idx.auction}`
      );
      returnRes.auction = auctionRes.data.data[0];
    }
    if (idx.gmarket) {
      const gmarketRes = await axiosInstance.get(
        `/CategoryMapping/OpenmarketSearchCategoryIdx?marketName=Gmarket&idx=${idx.gmarket}`
      );
      returnRes.gmarket = gmarketRes.data.data[0];
    }
    if (idx.smartstore) {
      const smartStoreRes = await axiosInstance.get(
        `/CategoryMapping/OpenmarketSearchCategoryIdx?marketName=SmartStore&idx=${idx.smartstore}`
      );
      returnRes.smartstore = smartStoreRes.data.data[0];
    }
    if (idx.elevenst) {
      const elevenstRes = await axiosInstance.get(
        `/CategoryMapping/OpenmarketSearchCategoryIdx?marketName=Elevenst&idx=${idx.elevenst}`
      );
      returnRes.elevenst = elevenstRes.data.data[0];
    }

    return returnRes;
  },
  uploadProduct: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Market/MarketUploadWorkList?uploadOption=0",
      data
    );

    return res;
  },

  editDefaultInfo: async (data: {}) => {
    const res = await axiosInstance.post("/Product/UpdateProduct", data);

    return res.data;
  },

  editMainImg: async (data: {}) => {
    const res = await axiosInstance.post("/Product/ProductMainImageEdit", data);

    return res.data;
  },
};

export const orderManage = {
  getOrder: async (market: string, account: string) => {
    const res = await axiosInstance.post("/OrderManagement/GetOrder", {
      market,
      marketAccount: account,
    });

    return res.data;
  },
  checkPcc: async (data: {}) => {
    const res = await axiosInstance.post("/OrderManagement/CheckPcc", data);

    return res.data;
  },

  updateDeliveryInfo: async (data: {}) => {
    const res = await axiosInstance.post(
      "/OrderManagement/UpdateDeliveryInfo",
      data
    );

    return res.data;
  },

  deleteOrder: async (data: number) => {
    const res = await axiosInstance.delete("/OrderManagement/DeleteOrder", {
      data: data,
    });

    return res.data;
  },
  downloadExcel: async (data: string[]) => {
    const res = await axiosInstance.post(
      "/OrderManagement/DownloadOrderXls",
      data,
      { responseType: "blob" }
    );

    return res.data;
  },
  updateOrderStatus: async (data: {}) => {
    const res = await axiosInstance.post(
      "/OrderManagement/UpdateOrderStatus",
      data
    );

    return res.data;
  },

  sendInvoice: async (data: {}) => {
    const res = await axiosInstance.post("/OrderManagement/SendInvoice", data);

    return res.data;
  },

  updateRevenue: async (data: {}) => {
    const res = await axiosInstance.post(
      "/OrderManagement/UpdateRevenue",
      data
    );

    return res.data;
  },
  getAccount: async (market: string) => {
    const res = await axiosInstance.get(
      `UserConfig/GetMarketAccount?market=${market}`
    );

    return res.data;
  },
  handleCS: async (data: {}) => {
    const res = await axiosInstance.post("/MarketCs/SetMarketCS", data);

    return res.data;
  },
};

export const collect = {
  collectTaobaoItemList: async (data: [], page: number, url: string) => {
    const res = await axiosInstance.post(
      `/Product/GetTaobaoSearchList?url=${url}&page=${page}`,
      data
    );

    return res.data;
  },

  collectTaobaoApi: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/TaobaoProductWorkList",
      data
    );

    return res.data;
  },
  collectTaobaoExtension: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/TaobaoProductWorkListExtension",
      data
    );

    return res.data;
  },
  collect1688UsingApi: async (data: {}) => {
    const res = await axiosInstance.post("/Product/1688ProductWorkList", data);
    return res.data;
  },

  collect1688UsingExtension: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/1688ProductWorkListExtension",
      data
    );

    return res.data;
  },
  collectVvicUsingApi: async (data: {}) => {
    const res = await axiosInstance.post("/Product/VVICProductWorkList", data);

    return res.data;
  },
  collectVvicUsingExtension: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/VVICProductWorkListExtension",
      data
    );

    return res.data;
  },
  collectAliUsingApi: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/AliExpressProductWorkList",
      data
    );
    return res.data;
  },

  collectAliUsingExtenstion: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/AliExpressProductWorkListExtension",
      data
    );
    return res.data;
  },
  collectCostco: async (data: {}) => {
    const res = await axiosInstance.post(
      "/Product/CostcoProductWorkList",
      data
    );

    return res.data;
  },
};
