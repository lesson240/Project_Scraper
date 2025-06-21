import { useEffect, useState } from "react";

import { ProhibitReplaceWord } from "@/interface/uploadinterface";
import { usePost } from "@/hooks/usePost";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { PagingButton } from "@/components/PagingButton/PagingButton";
import { ProhibitWord } from "./ProhibitionWordModal";
import { ReplaceWordTable } from "./component/replaceword/ReplaceWordTable";
import { ReplaceWordDeleteButton } from "./component/replaceword/ReplaceWordDeleteButton";
import { ReplaceWordInput } from "./component/replaceword/ReplaceWordInput";

interface Props {
  closeModal: () => void;
}

export const ReplaceWordModal = ({ closeModal }: Props) => {
  const [selectedReplaceWord, setSelectedReplaceWord] = useState<
    ProhibitReplaceWord[]
  >([]);
  const [replaceWordValue, setReplaceWordValue] = useState({
    targetWord: "",
    convertWord: "",
  });
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState({
    beforeWord: "",
    afterWord: "",
  });
  const [searchedData, setSearchedData] = useState<ProhibitWord[]>([]);
  const [sortedData, setSortedData] = useState<ProhibitWord[]>([]);
  const [renderData, setRenderData] = useState<ProhibitWord[]>([]);

  const getReplaceWord = usePost("/Product/GetCollectFillter", "Replace");

  useEffect(() => {
    getReplaceWord.mutate();
  }, []);

  useEffect(() => {
    if (getReplaceWord.data) {
      const newData = getReplaceWord.data.filter
        ? getReplaceWord.data.filter((item: ProhibitWord) => {
            const isMatchedBefore = item.targetWord.includes(
              searchValue.beforeWord
            );
            const isMatchedAfter = item.convertWord.includes(
              searchValue.afterWord
            );
            return isMatchedAfter && isMatchedBefore;
          })
        : [];

      setSearchedData(newData);
    }
  }, [getReplaceWord.data, searchValue]);

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
    if (renderData.length === selectedReplaceWord.length) {
      setSelectedReplaceWord([]);
    } else {
      await setSelectedReplaceWord([]);
      setSelectedReplaceWord(renderData);
    }
  };

  return (
    <ModalBg onClick={closeModal}>
      <ModalInnerTop>
        <>
          <div className="modal-header">
            <h5
              className="modal-title d-flex align-items-center"
              id="exampleModalLabel"
            >
              단어 치환 설정
            </h5>
            <button
              onClick={closeModal}
              type="button"
              className="btn-close"
            ></button>
          </div>
          <div className="modal-body">
            <ReplaceWordInput
              setReplaceWordValue={setReplaceWordValue}
              replaceWordValue={replaceWordValue}
              getReplaceWord={getReplaceWord}
            />
            <ReplaceWordDeleteButton
              setSelectedReplaceWord={setSelectedReplaceWord}
              selectedReplaceWord={selectedReplaceWord}
              length={getReplaceWord?.data?.length}
              getReplaceWord={getReplaceWord}
            />
            <ReplaceWordTable
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              clickAll={clickAll}
              isAll={
                renderData.length !== 0 &&
                renderData.length === selectedReplaceWord.length
              }
              getReplaceWord={getReplaceWord}
              replaceWordList={renderData}
              setSelectedReplaceWord={setSelectedReplaceWord}
              selectedReplaceWord={selectedReplaceWord}
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
