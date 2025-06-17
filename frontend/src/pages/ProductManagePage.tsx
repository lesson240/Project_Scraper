import { useState } from "react";
import { fetchProductData } from "../api/product";
import type { ProductFilter } from "../api/types";

export default function ProductManagePage() {
    const [filters, setFilters] = useState<ProductFilter>({});
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // 인풋 값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // 검색 버튼 클릭 핸들러
    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await fetchProductData(filters);
            // 응답이 문자열(HTML 혹은 JSON)이므로 바로 출력
            setResult(data);
        } catch (err) {
            setResult("에러 발생! 콘솔을 확인하세요.");
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>상품 관리</h2>
            <input name="brand_code" placeholder="브랜드 코드" onChange={handleChange} />
            <input name="group_name" placeholder="그룹명" onChange={handleChange} />
            <input name="memo_name" placeholder="메모" onChange={handleChange} />
            <input name="origin_goods_code" placeholder="상품코드" onChange={handleChange} />
            <button onClick={handleSearch}>검색</button>
            {loading && <p>로딩 중...</p>}
            <div style={{ whiteSpace: "pre-wrap", marginTop: "16px", background: "#f4f4f4", padding: "10px" }}>
                <strong>API 응답결과:</strong>
                <div>
                    {result}
                </div>
            </div>
        </div>
    );
}
