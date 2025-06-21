import api from "./axios";
import type { ProductFilter } from "./types";

// POST 요청 함수
export const fetchProductData = async (filters: ProductFilter) => {
    const res = await api.post("/v1/product-data", filters);
    return res.data;
};
