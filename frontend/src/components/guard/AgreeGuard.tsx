import arrow from "@/assets/images/agreeNextArrow.png";
import { PrivacyPolicy } from "@/components/footer/parts/PrivacyPolicy";
import { TermsOfUse } from "@/components/footer/parts/TermsOfUse";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import useToggle from "@/hooks/useToggle";
// import { agree, upload } from "@/utils/functions/postApi";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type AgreeKey = "service" | "collect" | "marketing";
export const AgreeGuard = () => {
    const openWindow = useInfoWindow();
    const client = useQueryClient();
    const { state: isService, handleToggle: handleService } = useToggle();
    const { state: isCollect, handleToggle: handleCollect } = useToggle();

    const [agreeValue, setAgreeValue] = useState({
        service: false,
        collect: false,
        marketing: false,
    });
    const [isCheckAll, setIsCheckAll] = useState(false);

    useEffect(() => {
        if (agreeValue.service && agreeValue.collect && agreeValue.marketing) {
            setIsCheckAll(true);
        } else {
            setIsCheckAll(false);
        }
    }, [agreeValue]);

    const clickAll = () => {
        if (isCheckAll) {
            setAgreeValue({
                service: false,
                collect: false,
                marketing: false,
            });
        } else {
            setAgreeValue({
                service: true,
                collect: true,
                marketing: true,
            });
        }
    };

    const clickCheckBox = (name: AgreeKey) => {
        setAgreeValue({
            ...agreeValue,
            [name]: !agreeValue[name],
        });
    };

    // 미구현
    // const submitForm = async () => {
    //     if (agreeValue.collect && agreeValue.service) {
    //         const res = await agree.agree(true, agreeValue.marketing);
    //         const setDetailRes = await upload.setDetailPageSetting({
    //             objectIds: [],
    //             useBaseConfig: true,
    //             detailPageConfig: {
    //                 market: "",
    //                 useDesc: false,
    //                 collocate: "POD",
    //                 addOptionImageConfig: {
    //                     style: "22",
    //                     fontSize: "SMALL",
    //                 },
    //                 addContent: {
    //                     bottomHtml: "",
    //                     topHtml: "",
    //                     useBottomContent: false,
    //                     useTopContent: false,
    //                 },
    //             },
    //         });
    //         if (res.status === "Success") {
    //             window.open("https://cafe.naver.com/mandeunydle", "_blank");
    //             client.invalidateQueries("user");
    //         }
    //     } else {
    //         openWindow("필수 동의에 체크를 해야합니다.");
    //     }
    // };

    return (
        <div className="agree-guard-background">
            <div className="agree-window mb-5">
                <p className="margin0 agree-title mb-5">약관동의</p>
                <div className="d-flex align-items-center gap-2 mb-4">
                    <span
                        onClick={clickAll}
                        className={`customCheckbox ${isCheckAll && "checked"}`}
                    />
                    <p className="margin0 agree-all">모두 동의</p>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className={`customCheckbox ${agreeValue.service && "checked"}`}
                            onClick={() => clickCheckBox("service")}
                        />
                        <p className="margin0 agree-select-text">
                            (필수) 서비스 이용약관 동의
                        </p>
                    </div>
                    <button onClick={handleService} className="madebutton">
                        <img src={arrow} />
                    </button>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className={`customCheckbox ${agreeValue.collect && "checked"}`}
                            onClick={() => clickCheckBox("collect")}
                        />
                        <p className="margin0 agree-select-text">
                            (필수) 개인정보 수집 및 이용에 대한 동의
                        </p>
                    </div>
                    <button onClick={handleCollect} className="madebutton">
                        <img src={arrow} />
                    </button>
                </div>
                <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                        className={`customCheckbox ${agreeValue.marketing && "checked"}`}
                        onClick={() => clickCheckBox("marketing")}
                    />
                    <p className="margin0 agree-select-text">
                        (선택) 이벤트 및 마케팅 활용 동의
                    </p>
                </div>
                <p className="margin0 marketing-text">
                    <span className="textRed">미동의 시</span> 프로모션에서{" "}
                    <span className="textRed">제외</span>됩니다.
                    <br />
                    네이버 카페, 올땀에서{" "}
                    <span className="textYellow">무료사용 신청글</span>을{" "}
                    <span className="textYellow">작성</span>해야지만,
                    <br /> 올땀 솔루션을 무료로 사용할 수 있습니다.
                </p>
                <button
                    // onClick={submitForm} 미구현
                    className="madebutton widthFull agree-submit-button mt-5"
                >
                    다음
                </button>
            </div>
            {isService && <TermsOfUse closeModal={handleService} />}
            {isCollect && <PrivacyPolicy closeModal={handleCollect} />}
        </div>
    );
};