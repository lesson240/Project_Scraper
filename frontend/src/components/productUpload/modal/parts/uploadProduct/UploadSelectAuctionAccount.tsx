import { useState } from "react";
import useFetch from "../../../../../hooks/useFetch";
import {
  ApplyCategory,
  CategorySearchKeyword,
} from "../../../../../interface/uploadinterface";
import { decryptByDES } from "../../../../../utils/functions/encrypt";
import { upload } from "../../../../../utils/functions/postApi";
import { checkMarketLogin } from "../../../../../utils/functions/checkMarketLogin";
import { UploadCompleteCheckAccount } from "./UploadCompleteCheckAccount";
import { AccountInfoType } from "../../../../../interface/settinginterface";

interface Props {
  applyCategory: ApplyCategory;
  isAutoMapping: boolean;
  setStoreName: React.Dispatch<React.SetStateAction<CategorySearchKeyword>>;
}

export const UploadSelectAuctionAccount = ({ setStoreName }: Props) => {
  const [isLogin, setIsLogin] = useState<boolean>();
  const [getAccount] = useFetch(
    `auctionAccount`,
    `/UserConfig/GetMarketAccount?market=Auction`
  );

  const storeNameSetFunc = (idx: number) => {
    setStoreName((prev) => {
      return {
        ...prev,
        Auction: getAccount[idx]?.storeName,
      };
    });
  };
  const selectAccount = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== "") {
      const loginRes = await checkMarketLogin(
        decryptByDES(getAccount[e.target.value]?.account!),
        "Auction"
      );
      if (!loginRes) {
        setIsLogin(false);
      }
      if ((loginRes as any).status === 200) {
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
        <p className="m-0 coupang-text1">옥션</p>
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
