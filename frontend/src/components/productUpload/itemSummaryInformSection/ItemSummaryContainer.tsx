// src/components/productUpload/itemSummaryInformSection/ItemSummaryContainer.tsx
import React, { useEffect, useState } from "react";
import ItemSummaryInformSection from "./ItemSummaryInformSection";
import axios from "@/lib/axios"; // axios 인스턴스 예시

// 아이템 데이터 타입
type Item = {
  origin_goods_name: string;
  goods_origin: number;
  thumb?: { thumb1?: string };
  market: string;
  collection_time?: string;
  priceRange?: string;
  priceRequired?: boolean;
  tagRequired?: boolean;
  origin_goods_code?: string;
  memo: string;
  group_name: string;
};

export default function ItemSummaryContainer() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지 당 개수
  const [pageSize] = useState("30개");

  /** 1. 데이터 로딩 */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/items"); // API 경로 예시
        setItems(response.data);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setError("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  /** 2. 속성 설정 */
  const handleAttributeSet = () => {
    console.log("속성 설정 API 호출 예정");
    // TODO: API 연동 로직 작성
  };

  /** 3. 옵션 설정 */
  const handleOptionSet = () => {
    console.log("옵션 설정 API 호출 예정");
    // TODO: API 연동 로직 작성
  };

  /** 4. 상세페이지 설정 */
  const handleDetailPageSet = () => {
    console.log("상세페이지 설정 API 호출 예정");
    // TODO: API 연동 로직 작성
  };

  /** 5. 업로드 로그 */
  const handleUploadSet = () => {
    console.log("업로드 로그 API 호출 예정");
    // TODO: API 연동 로직 작성
  };

  /** 6. 상품명 / 메모 수정 */
  const handleModifySet = async (id: string, field: "title" | "memo", value: string) => {
    try {
      console.log(`수정 API 호출: ID=${id}, field=${field}, value=${value}`);
      if (field === "title") {
        await axios.post(`/api/items/${id}/update-title`, { title: value });
      } else if (field === "memo") {
        await axios.post(`/api/items/${id}/update-memo`, { memo: value });
      }
      // 성공 시 items를 업데이트
      setItems((prev) =>
        prev.map((item) =>
          item.origin_goods_code === id
            ? {
                ...item,
                origin_goods_name: field === "title" ? value : item.origin_goods_name,
                memo: field === "memo" ? value : item.memo,
              }
            : item
        )
      );
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정에 실패했습니다.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>로딩 중...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <ItemSummaryInformSection
      items={items}
      pageSize={pageSize}
      onAttributeSet={handleAttributeSet}
      onOptionSet={handleOptionSet}
      onDetailPageSet={handleDetailPageSet}
      onUploadSet={handleUploadSet}
      onModifySet={handleModifySet}
    />
  );
}
