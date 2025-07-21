import React, { useState } from "react";
import "@/styles/upload/itemSummaryInformSection.css";
import TextInput from "@/components/common/TextInput";
import Button from "@/components/common/Button";
import Pagination from "@/components/common/Pagination";
import Tooltip from "@/components/common/Tooltip";
import TextInputWithButton from "@/components/common/TextInputWithButton";

type Item = {
    origin_goods_name: string;
    goods_origin: number;
    thumb?: {
        thumb1?: string;
    };
    market: string;
    collection_time?: string;
    priceRange?: string;
    priceRequired?: boolean;
    tagRequired?: boolean;
    origin_goods_code?: string;
    memo: string;
    group_name: string;
};


type Props = {
    items?: Item[];
    pageSize: string;
    onAttributeSet: () => void;
    onOptionSet: () => void;
    onDetailPageSet: () => void;
    onUploadSet: () => void;
    onModifySet?: () => void;
};



export default function ItemSummaryInformSection({
    items = [],
    pageSize,
    onAttributeSet,
    onOptionSet,
    onDetailPageSet,
    onUploadSet,
    onModifySet,
}: Props) {
    if (!Array.isArray(items) || items.length === 0) {
        return <div style={{ padding: "20px" }}>데이터가 없습니다.</div>;
    }
    const handleTitleChange = (id: string | undefined, value: string) => {
        console.log(`변경된 제목(${id}):`, value);
        // 추후 개별 수정 API 연동 시 사용
    };


    // Row 선택 상태 관리
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleRowClick = (e: React.MouseEvent, itemId: string) => {
        const target = e.target as HTMLElement;
            // 클릭 대상이 특정 요소(className)를 포함하면 handlerowclick 중지
            if (
                target.closest('.button-row') ||
                target.closest('.copy-icon') ||   
                target.closest('.goods-title') ||  
                target.closest('.goods-memo')         
            ) {
                return; // row 선택 동작 실행 안 함
            }
            // 기존 row 클릭 로직
            setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
            );
        };

    const toggleSelect = (itemId: string) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = (isChecked: boolean) => {
        const currentPageIds = currentItems.map((item) => item.origin_goods_code);
        if (isChecked) {
            // 현재 페이지 상품들 중 선택되지 않은 것들을 추가
            setSelectedItems((prev) => [
            ...prev,
            ...currentPageIds.filter((id) => !prev.includes(id)),
            ]);
        } else {
            // 현재 페이지 상품들을 선택 해제
            setSelectedItems((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        }
        };

    // 클립보드에 복사하는 기능
    const handleCopy = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        console.log("복사 성공:", text);
    } catch (err) {
        console.error('클립보드 복사 실패:', err);
    }
    };


    // Pagination 상태 관리
    const [currentPage, setCurrentPage] = useState(1);
    const pageSizeNumber = parseInt(pageSize.replace("개", ""), 10);
    const startIndex = (currentPage - 1) * pageSizeNumber;
    const currentItems = items.slice(startIndex, startIndex + pageSizeNumber);


    const CopyIcon = () => (
    <svg
        className="copy-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
    >
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zM19 5H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z" />
    </svg>
    );

        
    const handleAttributeSet = () => {
        console.log("속성 설정 API 호출 예정");
    };
    const handleOptionSet = () => {
        console.log("속성 설정 API 호출 예정");
    };
    const handleDetailPageSet = () => {
        console.log("속성 설정 API 호출 예정");
    };
    const handleUploadLogSet = () => {
        console.log("속성 설정 API 호출 예정");
    };


    return (
        <div>
            <table className="product-manage-table table-wrapper">
                <thead className="table-head">
                        <tr className="table-col ">
                            <input
                                type="checkbox"
                                checked={currentItems.every((item) =>
                                selectedItems.includes(item.origin_goods_code)
                                )}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            /></tr>

                        <tr className="table-col">수집 마켓</tr>
                        <tr className="table-col">상품정보</tr>
                        <tr className="table-col">기능</tr>
                        <tr className="table-col">상세정보</tr>
                </thead>
            
                <tbody>
                    {currentItems.map((item, index) => {
                        const isSelected = selectedItems.includes(item.origin_goods_code);
                        return (
                                <tr
                                key={item.origin_goods_code || `fallback-${index}`}
                                className={`table-row ${isSelected ? "selected-row" : ""}`}
                                onClick={(e) => handleRowClick(e, item.origin_goods_code || "")}
                                >
                                <td className="table-col">
                                    <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onClick={(e) => e.stopPropagation()} // 부모 클릭 방지
                                    onChange={() => toggleSelect(item.origin_goods_code || "")}
                                    />
                                </td>
                                
                                <td className="market-label">{item.market}</td>
                                
                                <td className="table-col-left">
                                    <img
                                        src={item.thumb?.thumb1 || "/images/default-thumb.jpg"}
                                        alt="상품 썸네일"
                                        className="thumb"
                                    />
                                    <div className="goods-details">
                                        <div className="goods-title">
                                            <TextInputWithButton
                                                // className="full-width"
                                                value={item.origin_goods_name}
                                                placeholder="상품명을 입력해주세요"
                                                buttonLabel="수정"
                                                onChange={(val) => handleTitleChange(item.origin_goods_code, val)}
                                                onButtonClick={() => onModifySet?.()}
                                            />          
                                        </div>
                                        <div className="goods-memo">
                                            <TextInputWithButton
                                                value={item.memo}
                                                placeholder="메모를 입력해주세요"
                                                buttonLabel="수정"
                                                onChange={(val) => handleTitleChange(item.origin_goods_code, val)}
                                                onButtonClick={() => onModifySet?.()}
                                            />
                                        </div>

                                        <div className="meta">상품 그룹: {item.group_name}     /원본상품코드: {item.origin_goods_code}
                                        
                                            <Tooltip text="코드복사">
                                            <span className="copy-icon" onClick={() => handleCopy(item.origin_goods_code)}>
                                            <CopyIcon />
                                            </span>
                                            </Tooltip>
                                        </div>
                                        <div className="meta">업로드 마켓: {item.market}</div>
                                    </div>
                                </td>
                                
                                <td>
                                    <div className="table-col button-group">
                                        <div className="button-row">
                                            <Button variant="secondary" onClick={onAttributeSet}>속성</Button>
                                            <Button variant="secondary" onClick={onOptionSet}>옵션</Button>
                                        </div>
                                        <div className="button-row">
                                            <Button variant="secondary" onClick={onDetailPageSet}>상세페이지</Button>
                                            <Button variant="secondary" onClick={onUploadSet}>업로드 로그</Button>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="table-col detail-col">
                                        <div className="basic-info">상품 수집일: {item.collection_time}</div>
                                        <div className="basic-info">원본 할인가 (¥): {item.goods_origin}</div>
                                        <div className="basic-info">설정 상품가 (￦): {item.priceRange}</div>
                                        {item.priceRequired && (
                                            <div className="alert">가격 설정해 주세요</div>
                                        )}
                                        {item.tagRequired && (
                                            <div className="alert">태그 설정해 주세요</div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalItems={items.length}
                itemsPerPage={pageSizeNumber}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}