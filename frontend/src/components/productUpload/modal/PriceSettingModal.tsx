import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PriceSettingExchangeRate } from "./component/pricesetting/PriceSettingExchangeRate";
import { UseMutationResult } from "react-query";
import {
  ExpectListType,
  MarketPrice,
  PriceType,
  UploadSummary,
} from "@/interface/uploadinterface";
import useFetch from "@/hooks/useFetch";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { PriceSetComponent } from "./component/pricesetting/PriceSetComponent";
import { PriceSetButton } from "./component/pricesetting/PriceSetButton";
import { ExpectMargin } from "./component/pricesetting/ExpectMargin";
import { madePercent } from "./function/madePercent";
import ModalContent from "@/components/shared/modal/ModalContent";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const PriceSettingModal = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const [exchangeRateValue, setExchangeRateValue] = useState({
    exchangeCNYBase: 0,
    exchangeUSDBase: 0,
  });

  const [getPrice] = useFetch("price", "/Market/GetPrice");
  const [isFreeDelivery, setIsFreeDelivery] = useState(true);
  const [expectList, setExpectList] = useState<ExpectListType[]>([]);

  const [price, setPrice] = useState<PriceType>({
    mainValue: 0,
    subValue: 0,
    deliveryBasicPrice: 0,
    deliveryExchangePrice: 0,
    deliveryReturnPrice: 0,
    Coupang: 0,
    Auction: 0,
    Gmarket: 0,
    Elevenst: 0,
  });

  useEffect(() => {
    if (!getPrice) return;
    setPrice({
      mainValue: getPrice.mainValue
        ? madePercent.intToPercent(getPrice.mainValue)
        : 0,
      subValue: getPrice.subValue,
      deliveryBasicPrice: getPrice.deliveryBasicPrice,
      deliveryReturnPrice: getPrice.deliveryReturnPrice,
      deliveryExchangePrice: getPrice.deliveryExchangePrice,
      Coupang: getPrice.marketExpandPrice
        ? getPrice.marketExpandPrice.filter(
            (item: MarketPrice) => item.market === "Coupang"
          )[0].addRatio
        : 0,
      Auction: getPrice.marketExpandPrice
        ? getPrice.marketExpandPrice.filter(
            (item: MarketPrice) => item.market === "Auction"
          )[0].addRatio
        : 0,
      Gmarket: getPrice.marketExpandPrice
        ? getPrice.marketExpandPrice.filter(
            (item: MarketPrice) => item.market === "Gmarket"
          )[0].addRatio
        : 0,
      Elevenst: getPrice.marketExpandPrice
        ? getPrice.marketExpandPrice.filter(
            (item: MarketPrice) => item.market === "Elevenst"
          )[0].addRatio
        : 0,
    });
  }, [getPrice]);

  return (
    <ModalContent width={1600}>
      <ModalContent.ModalHead>
        <h5 className="modal-title d-flex align-items-center text24 weight500 ">
          가격 설정
          <span className="three-selected">
            선택상품 {selectedItem?.length}개
          </span>
        </h5>
      </ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <div className="d-flex gap-5">
          <div className="width40">
            <PriceSettingExchangeRate
              exchangeRateValue={exchangeRateValue}
              setExchangeRateValue={setExchangeRateValue}
            />
            <PriceSetComponent
              setPrice={setPrice}
              price={price}
              setIsFreeDelivery={setIsFreeDelivery}
              isFreeDelivery={isFreeDelivery}
            />
            <PriceSetButton
              setExpectList={setExpectList}
              selectedItem={selectedItem}
              price={price}
              setSelectedItem={setSelectedItem}
              isFreeDelivery={isFreeDelivery}
              exchangeRateValue={exchangeRateValue}
              collectProductSummary={collectProductSummary}
            />
          </div>
          <ExpectMargin expectList={expectList} />
        </div>
      </ModalContent.ModalBody>
    </ModalContent>
  );
};
