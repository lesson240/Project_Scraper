import React, { useState } from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";
import FunctionSection from "@/components/productUpload/functionSection/FunctionSection";
import ItemSummaryContainer from "@/components/productUpload/itemSummaryInformSection/ItemSummaryContainer";
import ThumbnailModalContainer from "@/components/productUpload/modals/ThumbModal/ThumbnailModalContainer";
import "@/styles/section.css";
import axios from "@/lib/axios";
import apiConfig from "@/config/api";

export default function ProductUploadPage() {
  const [items, setItems] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState("30개");

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [currentThumbs, setCurrentThumbs] = useState<string[]>([]);
  const [currentOriginGoodsCode, setCurrentOriginGoodsCode] = useState<string>("");

  // 선택된 상품 목록 상태
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);
  const currentItems = items.slice(0, pageSizeNumber);
  const currentCount = currentItems.length;
  const totalCount = items.length;

  /** 검색 버튼 클릭 시 */
  const handleSearch = async (payload: Record<string, any>) => {
    const startTime = Date.now();
    
    try {
      console.log("🔍 API 요청 시작");
      console.log("📋 요청 데이터:", payload);
      console.log("🌐 요청 URL:", axios.defaults.baseURL + "/product-data");
      console.log("⏰ 시작 시간:", new Date().toISOString());
      
      // fetch로도 동시에 테스트
      console.log("🧪 fetch로 동시 테스트 시작");
      const fetchPromise = fetch('http://localhost:8000/v1/product-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const res = await axios.post("/product-data", payload);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log("✅ API 요청 성공");
      console.log("📊 응답 상태:", res.status);
      console.log("⏱️ 응답 시간:", duration + "ms");
      console.log("📦 백엔드 응답 데이터:", res.data);
      setItems(res.data);
      
      // fetch 결과도 확인
      try {
        const fetchRes = await fetchPromise;
        console.log("🧪 fetch 결과:", fetchRes.status);
      } catch (fetchErr) {
        console.log("🧪 fetch 에러:", fetchErr);
      }
      
    } catch (err: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error("❌ API 요청 실패");
      console.error("⏱️ 실패 시간:", duration + "ms");
      console.error("🚫 에러 타입:", err.constructor.name);
      console.error("🚫 에러 메시지:", err.message);
      console.error("🚫 에러 코드:", err.code);
      console.error("📡 에러 응답:", err.response);
      console.error("🌐 에러 요청:", err.request);
      console.error("⚙️ 에러 설정:", err.config);
      
      // fetch로도 테스트
      try {
        console.log("🧪 fetch로 재시도...");
        const fetchRes = await fetch('http://localhost:8000/v1/product-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log("🧪 fetch 성공:", fetchRes.status);
      } catch (fetchErr) {
        console.log("🧪 fetch도 실패:", fetchErr);
      }
    }
  };

  /** 썸네일 클릭 시 모달 열기 */
  const handleThumbClick = (images: string[], originGoodsCode: string) => {
    if (!originGoodsCode) {
      console.error('ProductUploadPage: originGoodsCode가 비어있음');
      return;
    }

    const normalize = (url: string) => {
      if (!url) return url;
      // 절대 경로(로컬 정적) → baseUrl 프리픽스
      if (url.startsWith('/')) return `${apiConfig.baseUrl}${url}`;
      // 과거 8001 호스트 참조를 8000으로 정규화
      const fixed = url.replace(/http:\/\/(localhost|127\.0\.0\.1):8001/g, apiConfig.baseUrl);
      // 잘못된 플레이스홀더 파일명 제거
      if (fixed.includes('unknown_image')) return '';
      return fixed;
    };

    setCurrentThumbs(images.map(normalize).filter(Boolean));
    setCurrentOriginGoodsCode(originGoodsCode);
    setModalOpen(false);          // 모달 닫았다가
    setTimeout(() => {            // 다음 tick에 열어 초기화 강제
      setModalOpen(true);
    }, 0);
  };

  /** 상품명/메모 수정 */
  const onModifySet = async (
    id: string,
    field: "title" | "memo",
    value: string
  ) => {
    const url = field === "title" ? "/save-goods-name" : "/save-goods-memo";
    const payload =
      field === "title"
        ? [{ origin_goods_code: id, modified_goods_name: value }]
        : [{ origin_goods_code: id, memo: value }];

    await axios.post(url, payload);
  };

  return (
    <div>
      <div className="columns-auto-fit-large">
        <SearchFilterSection onSearchClick={handleSearch} />
      </div>

      <FunctionSection
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentCount={currentCount}
        totalCount={totalCount}
        selectedItems={selectedItems}
        items={items}
      />

      <ItemSummaryContainer
        items={items}
        pageSize={pageSize}
        onThumbClick={handleThumbClick} // ✅ 썸네일 클릭 시 모달 열기
        onAttributeSet={() => { }}
        onOptionSet={() => { }}
        onDetailPageSet={() => { }}
        onUploadSet={() => { }}
        onModifySet={onModifySet}
        onSelectedItemsChange={setSelectedItems}
      />

      {/* ✅ 모달은 컨테이너에서 관리 */}
      <ThumbnailModalContainer
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultImages={currentThumbs}
        onSave={(imgs) => setCurrentThumbs(imgs)}
        origin_goods_code={currentOriginGoodsCode}
      />
    </div>
  );
}
