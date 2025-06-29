import React, { useState } from "react";
import "@/styles/section.css"
import "@/styles/collect/collectResultSection.css";

const dummyProducts = Array.from({ length: 12 }, (_, idx) => ({
  id: idx + 1,
  title: `상품 제목 ${idx + 1}`,
  price: Math.floor(Math.random() * 500 + 100),
  image: "https://via.placeholder.com/150", // 임시 이미지
}));

export default function CollectResultSection() {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

    return (
        <section className="section-block">
            <main className="section-head">
        <span>선택된 상품 수 {selected.length}</span>
        <div className="pagination"> {/* 실제 pagination은 추후 구현 */} 1 2 3 4 5 ...</div>
        <div className="result-buttons">
          <button onClick={() => setSelected([])}>선택 상품 초기화</button>
          <button className="collect-btn">수집</button>
        </div>
      <div className="result-grid">
        {dummyProducts.map((product) => (
          <div key={product.id} className="result-card">
            <input
              type="checkbox"
              checked={selected.includes(product.id)}
              onChange={() => toggleSelect(product.id)}
            />
            <img src={product.image} alt={product.title} />
            <div className="result-info">
              <p className="result-title">{product.title}</p>
              <p className="result-price">{product.price}원</p>
              <button className="go-button">바로가기</button>
            </div>
          </div>
        ))}
  </div>              
            </main>
            {/* 계정정보 하위 ui 존재 */}
        </section>
    );
}
