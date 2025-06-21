import { useState } from "react";
import { ProductNameInfoTable } from "./component/productname/ProductNameInfoTable";
import { ProductNameKeyWordSetting } from "./component/productname/ProductNameKeyWordSetting";
import { ProductNameSetButtonBox } from "./component/productname/ProductNameSetButtonBox";
import { ProductNameSubtitleAndButton } from "./component/productname/ProductNameSubtitleAndButton";
import { ProductNameWordSettingButton } from "./component/productname/ProductNameWordSettingButton";
import { UseMutationResult } from "react-query";
import { UploadSummary } from "@/interface/uploadinterface";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { useInput } from "@/hooks/useInput";
import { CrawledKeyword } from "./TagSettingModal";
import { ProductNameRelKeywordList } from "./component/productname/ProductNameRelKeywordList";
import ModalContent from "@/components/shared/modal/ModalContent";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const ProductNameSettingModal = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const [relKeywordList, setRelKeywordList] = useState<CrawledKeyword>({
    rel: [],
    auto: [],
  });
  const [naverAdKeyword, setNaverAdKeyword] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameSelect, setNameSelect] = useState<string[]>([]);

  const [settingKeyWordValue, inputSettingKeyWordValue] = useInput({
    forwardKeyword: "",
    backKeyword: "",
  });
  const [wordLengthLimit, setWordLengthLimit] = useState(49);
  const [productNameValueList, setProductNameValueList] = useState(
    selectedItem.map((item) => {
      return {
        code: item.id,
        text: item?.title?.[1]?.text
          ? item?.title?.[1]?.text
          : item?.title?.[0]?.text,
      };
    })
  );

  return (
    <ModalContent width={1300}>
      <ModalContent.ModalHead>
        <h5
          className="modal-title d-flex align-items-center"
          id="exampleModalLabel"
        >
          상품명 설정{" "}
          <span className="three-selected">
            선택상품 {selectedItem.length}개
          </span>
        </h5>
      </ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <ProductNameWordSettingButton
          setProductNameValueList={setProductNameValueList}
          setWordLengthLimit={setWordLengthLimit}
          wordLengthLimit={wordLengthLimit}
        />
        <ProductNameKeyWordSetting
          setIsLoading={setIsLoading}
          setNaverAdKeyword={setNaverAdKeyword}
          setRelKeywordList={setRelKeywordList}
          productNameValueList={productNameValueList}
          setProductNameValueList={setProductNameValueList}
          settingKeyWordValue={settingKeyWordValue}
          inputSettingKeyWordValue={inputSettingKeyWordValue}
        />
        <ProductNameRelKeywordList
          productNameValueList={productNameValueList}
          nameSelect={nameSelect}
          setProductNameValueList={setProductNameValueList}
          isLoading={isLoading}
          relKeywordList={relKeywordList}
          naverAdKeyword={naverAdKeyword}
        />
        <ProductNameSubtitleAndButton />
        <ProductNameInfoTable
          nameSelect={nameSelect}
          setNameSelect={setNameSelect}
          wordLengthLimit={wordLengthLimit}
          selectedItem={selectedItem}
          productNameValueList={productNameValueList}
          setProductNameValueList={setProductNameValueList}
        />
        <ProductNameSetButtonBox
          setSelectedItem={setSelectedItem}
          collectProductSummary={collectProductSummary}
          selectedItem={selectedItem}
          setProductNameValueList={setProductNameValueList}
          productNameValueList={productNameValueList}
        />
      </ModalContent.ModalBody>
    </ModalContent>
  );
};
