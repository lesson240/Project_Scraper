import useFetch from "@/hooks/useFetch";
import { MarketAccount } from "@/interface/productmanageinterface";
import { checkMarketLogin } from "@/utils/functions/checkMarketLogin.js";

interface Props {
  marketAccountValue: MarketAccount | undefined;
  setMarketAccountValue: React.Dispatch<
    React.SetStateAction<MarketAccount | undefined>
  >;
}

export const SearchingBoardAccountSelect = ({
  marketAccountValue,
  setMarketAccountValue,
}: Props) => {
  const [marketAccountList] = useFetch(
    ["marketAccount", marketAccountValue?.market as string],
    `/ProductManagement/GetUserMarketAccount?market=${
      marketAccountValue?.market === "SmartStore"
        ? "SmartStoreAPI"
        : marketAccountValue?.market
    }`
  );

  const selectMarket = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMarketAccountValue({
      ...(marketAccountValue as MarketAccount),
      [name]: value,
    });
  };

  const selectAccout = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await setMarketAccountValue({
      ...(marketAccountValue as MarketAccount),
      account: marketAccountList[e.target.value],
    });
    await checkMarketLogin(
      marketAccountList[e.target.value]?.account,
      marketAccountValue?.market
    );
  };

  return (
    <div className="row">
      <div className="product-label select-image col-md-3 col-12 width-devide-1">
        <label htmlFor="accountSelect">계정 선택</label>
        <select
          onChange={selectMarket}
          name="market"
          defaultValue=""
          id="accountSelect"
          className="form-select"
          aria-label="Default select example"
        >
          {OPENMARKET.map((option) => (
            <option key={option.id} value={option.value}>
              {option.marketName}
            </option>
          ))}
        </select>
      </div>
      <div className="product-label select-image col-md-3 col-12 pt-2 width-devide-1">
        <label htmlFor="product-name311"></label>
        <select
          onChange={selectAccout}
          defaultValue=""
          name="marketAccount"
          id="product-name311"
          className="form-select"
        >
          <option>계정을 선택해주세요</option>
          {Array.isArray(marketAccountList) ? (
            marketAccountList?.map((account: any, idx: any) => (
              <option
                key={idx}
                value={idx}
              >{`[${account.account}] ${account.storeName}`}</option>
            ))
          ) : (
            <option>오픈마켓을 선택해 주세요</option>
          )}
        </select>
      </div>
    </div>
  );
};

const OPENMARKET = [
  {
    id: 0,
    marketName: "오픈마켓을 선택해 주세요",
    value: "",
  },
  {
    id: 1,
    marketName: "스마트스토어",
    value: "SmartStore",
  },
  {
    id: 2,
    marketName: "쿠팡",
    value: "Coupang",
  },
  {
    id: 3,
    marketName: "지마켓",
    value: "Gmarket",
  },
  {
    id: 4,
    marketName: "옥션",
    value: "Auction",
  },
  {
    id: 5,
    marketName: "11번가",
    value: "Elevenst",
  },
];
