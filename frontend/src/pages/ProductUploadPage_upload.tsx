// src/pages/ProductManagePage.tsx

import NavBar from "../components/navBar/NavBar";
import { NavUpload } from "../components/navBar/parts/NavProductUpload";
import { usePost } from "../hooks/usePost";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterSection from "../components/productUpload/filterSection/FilterSection";
import FunctionSection from "../components/productUpload/functionSection/FunctionSection";
import ItemSummaryInformSection from "../components/productUpload/itemSummaryInformSection/ItemSummaryInformSection";
import { ProductManagePagination } from "../components/productManage/productManagePagination/ProductManagePagination";
import "../styles/productUpload.css";
import { useRecoilValue } from "recoil";
import { isDeskTop } from "../atom/atom";
// ProductManagePage.tsx, import 구문들 아래에 추가
declare const chromeAPI: any;

// 1. 기본 검색값 타입 및 기본값
export interface ProductUploadSearchValue {
    code: string;
    groupName: string;
    memo: string;
    productName: string;
    uploadWorkNumber: string | null;
    workNumber: string | null;
    startDate: string;
    endDate: string;
    pageNum: number;
    pageLimit: number;
    perPage: number;
    market: string;
    marketAccount: string;
}

interface FilterSectionProps {
    productManageSummary: ReturnType<typeof usePost>;
    searchValue: ProductUploadSearchValue;
    setSearchValue: React.Dispatch<React.SetStateAction<ProductUploadSearchValue>>;
    defaultSearch: ProductUploadSearchValue;
    clickSearch: () => void;
}


const DEFAULT_SEARCHVALUE: ProductUploadSearchValue = {
    code: "",
    groupName: "",
    memo: "",
    productName: "",
    uploadWorkNumber: null,
    workNumber: null,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString()
        .slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    pageNum: 1,
    pageLimit: 30,
    perPage: 30,
    market: "",
    marketAccount: "",
};

const ProductManagePage = () => {
    // 2. 상태 정의
    const [page, setPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<any[]>([]);
    const isDesktop = useRecoilValue(isDeskTop);
    const [searchValue, setSearchValue] =
        useState<ProductUploadSearchValue>(DEFAULT_SEARCHVALUE);

    // 3. 검색 API 호출 커스텀 훅 (API 경로/파라미터 수정!)
    const collectProductSummary = usePost("/ProductManagement/SearchMarketProductSummary", {
        ...searchValue,
        market: searchValue.market?.toUpperCase?.() ?? "",
        pageNum: page,
        uploadWorkNumber:
            searchValue.uploadWorkNumber === "" ? null : searchValue.uploadWorkNumber,
        workNumber: searchValue.workNumber === "" ? null : searchValue.workNumber,
    });

    const navigate = useNavigate();

    // 4. (선택) 확장프로그램 체크
    useEffect(() => {
        const checkExtension = async () => {
            try {
                const res = await chromeAPI.exCheck();
                return res.data;
            } catch {
                navigate("/home");
            }
        };
        isDesktop && checkExtension();
    }, [isDesktop, navigate]);

    // 5. 페이지 이동 시 스크롤 위치 초기화
    useEffect(() => {
        localStorage.setItem("scrollPosition", "0");
    }, [page]);

    // 6. 페이지 이동 함수
    const clickNextPage = async () => {
        setPage((prev) => prev + 1);
        collectProductSummary.mutate();
    };
    const clickPrevPage = async () => {
        setPage((prev) => prev - 1);
        collectProductSummary.mutate();
    };
    const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setPage(parseInt(e.currentTarget.value));
        collectProductSummary.mutate();
    };

    // 7. 검색 버튼 핸들러
    const clickSearch = () => {
        collectProductSummary.mutate();
        setSelectedItem([]);
    };

    // 8. 페이지 반환
    return (
        <>
            <NavBar>
                <NavUpload />
            </NavBar>
            {/* 1. 검색/필터 영역 */}
            <FilterSection
                collectProductSummary={collectProductSummary}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                defaultSearch={DEFAULT_SEARCHVALUE}
                clickSearch={clickSearch}
            />
            {/* 2. 기능/액션 버튼 영역 */}
            <FunctionSection
                setPage={setPage}
                setSelectedItem={setSelectedItem}
                selectedItem={selectedItem}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                productManageSummary={collectProductSummary}
            />
            {/* 3. 리스트/테이블 영역 */}
            <ItemSummaryInformSection
                setSelectedItem={setSelectedItem}
                selectedItem={selectedItem}
                productManageSummary={collectProductSummary}
                page={page}
            />
            {/* 4. 페이지네이션 */}
            {collectProductSummary?.data && (
                <PaginationPagination
                    totalPages={collectProductSummary?.data?.totalPage}
                    currentPage={page}
                    onClick={onClick}
                    clickNextPage={clickNextPage}
                    clickPrevPage={clickPrevPage}
                />
            )}
        </>
    );
};

export default ProductManagePage;
