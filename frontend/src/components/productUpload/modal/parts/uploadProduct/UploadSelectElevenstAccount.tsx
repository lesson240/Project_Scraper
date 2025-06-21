import { useState } from "react";
import useFetch from "../../../../../hooks/useFetch";
import {
  ApplyCategory,
  CategorySearchKeyword,
} from "../../../../../interface/uploadinterface";
import { decryptByDES } from "../../../../../utils/functions/encrypt";
import { UploadCompleteCheckAccount } from "./UploadCompleteCheckAccount";
import { AccountInfoType } from "../../../../../interface/settinginterface";
import { upload } from "../../../../../utils/functions/postApi";

interface Props {
  applyCategory: ApplyCategory;
  isAutoMapping: boolean;
  setStoreName: React.Dispatch<React.SetStateAction<CategorySearchKeyword>>;
}

export const UploadSelectElevenstAccount = ({ setStoreName }: Props) => {
  const [isLogin, setIsLogin] = useState<boolean>();
  const [getAccount] = useFetch(
    `elevenstAccount`,
    `/UserConfig/GetMarketAccount?market=Elevenst`
  );

  const storeNameSetFunc = (idx: number) => {
    setStoreName((prev) => {
      return {
        ...prev,
        Elevenst: getAccount[idx]?.storeName,
      };
    });
  };

  const selectAccount = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== "") {
      const checkRes = await upload.checkElevenstLogin({
        account: decryptByDES(getAccount[e.target.value]?.account!),
        openApiKey: decryptByDES(getAccount[e.target.value]?.openApiKey),
      });
      if (checkRes) {
        setIsLogin(true);
        storeNameSetFunc(parseInt(e.target.value));
      }
    } else {
      setIsLogin(undefined);
    }
  };

  return (
    <div className="row align-items-center mt-4">
      <div className="col-md-2 col-12">
        <p className="m-0 coupang-text1">11번가 글로벌</p>
      </div>
      <div className="product-label select-image col-md-8 col-12">
        <div className="state-selection">
          <select
            onChange={selectAccount}
            className="form-select option-image1"
          >
            <option value="">계정을 선택해주세요.</option>
            {getAccount?.map((item: AccountInfoType, idx: number) => (
              <option key={item.account} value={idx}>
                {decryptByDES(item?.account!)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isLogin !== undefined && (
        <>
          {isLogin ? (
            <UploadCompleteCheckAccount />
          ) : (
            <div className="col-md-2 col-12 oneLine textRed textSm">
              로그인을 확인해주세요.
            </div>
          )}
        </>
      )}
    </div>
  );
};
