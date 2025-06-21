import NavBar from "@/components/navBar/NavBar";
import { NavUpload } from "@/components/navBar/parts/NavUpload";
import { usePost } from "@/hooks/usePost";
import { SearchValue, UploadSummary } from "@/interface/uploadinterface";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadSearchingBoard } from "@/components/productUpload/uploadSearching/UploadSearchingBoard";
import { UploadModalButtonBox } from "@/components/productUpload/uploadModalButton/UploadModalButtonBox";
import { UploadResultTable } from "@/components/productUpload/uploadResultTable/UploadResultTable";
import { PagingButton } from "@/components/pagingButton/PagingButton";
import chromeAPI from "@/utils/functions/chromeAPI.js";
import "@/styles/productUpload.css";
import { useRecoilValue } from "recoil";
import { isDeskTop } from "@/atom/atom";

const Upload = () => {
  const [page, setPage] = useState(1);
  const [isViewWayDetail, setIsViewWayDetail] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<UploadSummary[]>([]);
  const isDesktop = useRecoilValue(isDeskTop);
  const [searchValue, setSearchValue] =
    useState<SearchValue>(DEFAULT_SEARCHVALUE);
  const collectProductSummary = usePost(
    "/Product/SearchCollectProductSummary",
    {
      ...searchValue,
      nonUpload: {
        ...searchValue.nonUpload,
        market: searchValue.nonUpload.market.toLocaleUpperCase(),
      },
      pageNum: page,
      uploadWorkNumber:
        searchValue.uploadWorkNumber === ""
          ? null
          : searchValue.uploadWorkNumber,
      workNumber: searchValue.workNumber === "" ? null : searchValue.workNumber,
    }
  );

  const navigate = useNavigate();
  const checkExtension = async () => {
    const res = await chromeAPI.exCheck();
    return res.data;
  };

  useEffect(() => {
    isDesktop &&
      checkExtension()
        .then((res) => { })
        .catch(() => {
          navigate("/home");
        });
  }, []);

  useEffect(() => {
    localStorage.setItem("scrollPosition", "0");
  }, [page]);

  const clickNextPage = async () => {
    await setPage((prev) => prev + 1);
    await collectProductSummary.mutate();
  };

  const clickPrevPage = async () => {
    await setPage((prev) => prev - 1);
    await collectProductSummary.mutate();
  };

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await setPage(parseInt(e.currentTarget.value));
    await collectProductSummary.mutate();
  };

  const clickSearch = () => {
    collectProductSummary.mutate();
    setSelectedItem([]);
  };

  return (
    <>
      <NavBar>
        <NavUpload />
      </NavBar>
      <UploadSearchingBoard
        collectProductSummary={collectProductSummary}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        defaultSearch={DEFAULT_SEARCHVALUE}
        clickSearch={clickSearch}
      />
      <UploadModalButtonBox
        setPage={setPage}
        setSelectedItem={setSelectedItem}
        isViewWayDetail={isViewWayDetail}
        setIsViewWayDetail={setIsViewWayDetail}
        selectedItem={selectedItem}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        collectProductSummary={collectProductSummary}
      />
      <UploadResultTable
        isViewWayDetail={isViewWayDetail}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
        collectProductSummary={collectProductSummary}
        page={page}
      />
      {collectProductSummary?.data && (
        <PagingButton
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

const DEFAULT_SEARCHVALUE: SearchValue = {
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
  nonUpload: {
    market: "",
    marketAccount: "",
  },
};

export default Upload;
