// src/types/product.ts
export type Item = {
  origin_goods_name?: string;
  goods_origin?: number;
  modified_goods_name?: string;
  thumb?: { thumb1?: string };
  market?: string;
  collection_time?: string;
  priceRange?: string;
  priceRequired?: boolean;
  tagRequired?: boolean;
  origin_goods_code?: string;
  memo?: string;
  group_name?: string;
  thumbnailImages?: string[];
  total_price?: number;
  promotion_period?: string;
  selling_price?: number;
  sold_out?: string;
  winner_price?: string;
};
