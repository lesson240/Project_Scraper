import { useState } from "react";
import { UploadCompleteCheckAccount } from "./UploadCompleteCheckAccount";
import useFetch from "@/hooks/useFetch";
import { decryptByDES } from "@/utils/functions/encrypt";
import { AccountInfoType } from "@/interface/settinginterface";
import { upload } from "@/utils/functions/postApi";
import {
  ApplyCategory,
  CategorySearchKeyword,
} from "@/interface/uploadinterface";

interface Props {
  applyCategory: ApplyCategory;
  isAutoMapping: boolean;
  setStoreName: React.Dispatch<React.SetStateAction<CategorySearchKeyword>>;
}

export const UploadSelectCoupangAccount = ({
  setStoreName,
  applyCategory,
  isAutoMapping,
}: Props) => {
  const [isLogin, setIsLogin] = useState<boolean>();
  const [getAccount] = useFetch(
    `coupangAccount`,
    `/UserConfig/GetMarketAccount?market=Coupang`
  );

  const storeNameSetFunc = (idx: number) => {
    setStoreName((prev) => {
      return {
        ...prev,
        Coupang: getAccount[idx]?.storeName,
      };
    });
  };

  const selectAccount = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== "") {
      const newKey = {
        ...getAccount[e.target.value],
        account: decryptByDES(getAccount[e.target.value]?.account!),
        accessKey: decryptByDES(getAccount[e.target.value]?.accessKey!),
        secretKey: decryptByDES(getAccount[e.target.value]?.secretKey!),
        vendorId: decryptByDES(getAccount[e.target.value]?.vendorId!),
      };
      const checkRes = await upload.checkCoupangLogin(newKey);
      if (checkRes) {
        setIsLogin(true);
        storeNameSetFunc(parseInt(e.target.value));
      }
    } else {
      setIsLogin(false);
    }
  };

  return (
    <div className="row align-items-center mt-4">
      <div className="col-md-2 col-12">
        <p className="m-0 coupang-text1">쿠팡</p>
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
