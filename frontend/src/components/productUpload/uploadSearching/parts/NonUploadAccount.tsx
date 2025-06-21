import useFetch from "@/hooks/useFetch";
import { Account, AccountList, SearchValue } from "@/interface/uploadinterface";

interface Props {
  selectNonUploadMarketAccount: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
}

export const NonUploadAccout = ({
  selectNonUploadMarketAccount,
  searchValue,
}: Props) => {
  const [accountList] = useFetch(
    "accountList",
    "/MarketInfo/GetUserAllMarketAccount"
  );

  return (
    <div className="product-label select-image col-md-6 col-12 group-pro-2">
      <label htmlFor="product-name34">미업로드 마켓</label>
      <div className="state-selection">
        <select
          value={`${searchValue.nonUpload.market}>>${searchValue.nonUpload.marketAccount}`}
          className="form-select"
          onChange={selectNonUploadMarketAccount}
        >
          <option>마켓과 계정을 선택해주세요</option>
          {accountList?.map &&
            accountList?.map(
              (item: AccountList) =>
                item?.children?.map((account: Account) => (
                  <option key={account?.id} value={account?.id}>
                    {`${item.label}_${account.label
                      .split(" ")[0]
                      .split("[")
                      .join("")
                      .split("]")
                      .join("")}(${account.label.split(" ")[1]})`}
                  </option>
                ))
            )}
        </select>
      </div>
    </div>
  );
};
