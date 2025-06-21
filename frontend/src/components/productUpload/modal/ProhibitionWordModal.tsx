import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { usePost } from "@/hooks/usePost";
import { ProhibitReplaceWord } from "@/interface/uploadinterface";
import { useEffect, useState } from "react";
import { PagingButton } from "@/components/PagingButton/PagingButton";
import { ProhibitWordTable } from "./component/prohibitword/ProhibitWordTable";
import { ProhibitWordDeleteButton } from "./component/prohibitword/ProhibitWordDeleteButton";
import { ProhibitWordInput } from "./component/prohibitword/ProhibitWordInput";

interface Props {
  closeModal: () => void;
}

export const ProhibitionWordModal = ({ closeModal }: Props) => {
  // const [searchValue, setSearchValue] = useState("");
  const getProhibitWord = usePost("/Product/GetCollectFillter", "Remove");
  const [sortedData, setSortedData] = useState<ProhibitWord[]>([]);
  const [renderData, setRenderData] = useState<ProhibitWord[]>([]);
  const [searchedData, setSearchedData] = useState<ProhibitWord[]>([]);
  const [prohibitWord, setProhibitWord] = useState("");
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedProhibitWordList, setSelectedProhibitWordList] = useState<
    ProhibitReplaceWord[]
  >([]);
  const [searchProhibitValue, setSearchProhibitValue] = useState("");

  useEffect(() => {
    getProhibitWord.mutate();
  }, []);

  useEffect(() => {
    if (getProhibitWord.data) {
      const filteredData = getProhibitWord?.data?.filter
        ? getProhibitWord?.data?.filter((item: ProhibitWord) =>
            item.targetWord.includes(searchProhibitValue)
          )
        : [];
      setSearchedData(filteredData);
    }
  }, [searchProhibitValue, getProhibitWord.data]);

  useEffect(() => {
    if (searchedData) {
      searchedData.sort((a: ProhibitWord, b: ProhibitWord) => {
        const dateA = new Date(a.regDate);
        const dateB = new Date(b.regDate);
        if (dateA < dateB) {
          return 1;
        }
        if (dateA > dateB) {
          return -1;
        }

        return 0;
      });
      setSortedData(searchedData);
      setTotalPage(Math.ceil(searchedData.length / 5));
    }
  }, [searchedData]);

  useEffect(() => {
    const newArr = [...sortedData];
    setRenderData(newArr.splice((currentPage - 1) * 5, 5));
  }, [sortedData, currentPage]);

  const clickNextPage = async () => {
    await setCurrentPage((prev) => prev + 1);
  };
  const clickPrevPage = async () => {
    await setCurrentPage((prev) => prev - 1);
  };
  const clickPage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await setCurrentPage(parseInt(e.currentTarget.value));
  };

  const clickAll = async () => {
    if (renderData.length === selectedProhibitWordList.length) {
      setSelectedProhibitWordList([]);
    } else {
      await setSelectedProhibitWordList([]);
      setSelectedProhibitWordList(renderData);
    }
  };

  return (
    <ModalBg onClick={closeModal}>
      <ModalInnerTop>
        <>
          <div className="modal-header modal-sticky">
            <h5
              className="modal-title d-flex align-items-center"
              id="exampleModalLabel"
            >
              금지 단어 설정
            </h5>
            <button
              onClick={closeModal}
              type="button"
              className="btn-close"
            ></button>
          </div>
          <div className="modal-body">
            {/* <form className="" onSubmit={searchPatent}>
              <input onChange={inputSearchValue} value={searchValue} />
              <button>제출</button>
            </form> */}
            <ProhibitWordInput
              setProhibitWord={setProhibitWord}
              prohibitWord={prohibitWord}
              getProhibitWord={getProhibitWord}
            />
            <ProhibitWordDeleteButton
              getProhibitWord={getProhibitWord}
              length={getProhibitWord?.data?.length}
              selectedProhibitWordList={selectedProhibitWordList}
              setSelectedProhibitWordList={setSelectedProhibitWordList}
            />
            <ProhibitWordTable
              searchProhibitValue={searchProhibitValue}
              setSearchProhibitValue={setSearchProhibitValue}
              isAll={
                renderData.length !== 0 &&
                renderData.length === selectedProhibitWordList.length
              }
              clickAll={clickAll}
              prohibitWord={renderData}
              setSelectedProhibitWordList={setSelectedProhibitWordList}
              selectedProhibitWordList={selectedProhibitWordList}
              getProhibitWord={getProhibitWord}
            />
            <div className="mt-3">
              {totalPage > 1 && (
                <PagingButton
                  totalPages={totalPage}
                  currentPage={currentPage}
                  clickNextPage={clickNextPage}
                  clickPrevPage={clickPrevPage}
                  onClick={clickPage}
                />
              )}
            </div>
          </div>
        </>
      </ModalInnerTop>
    </ModalBg>
  );
};

export interface ProhibitWord {
  convertWord: string;
  idx: number;
  regDate: string;
  targetWord: string;
  type: string;
}
