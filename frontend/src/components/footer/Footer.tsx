import ydle from "../../assets/images/logo/ydleLogo.svg";
import allttam from "../../assets/images/logo/allttam.svg";
import "./Footer.css";
import useToggle from "../../hooks/useToggle";
import { PrivacyPolicy } from "./parts/PrivacyPolicy";
import { TermsOfUse } from "./parts/TermsOfUse";
import { useEffect, useState } from "react";

export const Footer = () => {
    const { state: isUsePolicy, handleToggle: handleUsePolicy } = useToggle();
    const { state: isPrivacy, handleToggle: handlePrivacy } = useToggle();

    return (
        <>
            <div className="footer landing-pc">
                <div className="d-flex gap-4">
                    <img src={ydle} />
                    <img src={allttam} />
                </div>
                <div className="footer-divider" />
                <p className="footer-contents">
                    상호명 이들 <span className="textDivider">|</span> 대표 유성용
                    <span className="textDivider">|</span>사업자등록번호 306-09-65729
                    <span className="textDivider">|</span> 통신판매업신고번호
                    2023-경기하남-0330
                </p>
                <p className="footer-contents">
                    주소 경기도 하남시 미사강변한강로 135 스카이폴리스 나동 743호{" "}
                    <span className="textDivider">|</span> 개인정보보호 책임자 유성용
                </p>
                <p className="footer-contents">
                    업무시간 평일 10:00 ~ 17:00 _ 점심 12:00 ~ 14:00 토,일,공휴일 휴무 |
                    제휴 • 요청문의{" "}
                    <a className="footer-contents" href="mailto:request@allttam.com">
                        request@allttam.com
                    </a>
                </p>
                <div className="mt-4 policy-container">
                    <p className="footer-contents">
                        Copyright ⓒ 2023 allttam All Rights Reserved
                    </p>
                    <div className="policybutton-container">
                        <button
                            className="oneLine madebutton policybutton2"
                            onClick={handleUsePolicy}
                        >
                            서비스이용약관
                        </button>
                        <button
                            onClick={handlePrivacy}
                            className="oneLine madebutton policybutton2"
                        >
                            개인정보처리지침
                        </button>
                    </div>
                </div>
                {isUsePolicy && <TermsOfUse closeModal={handleUsePolicy} />}
                {isPrivacy && <PrivacyPolicy closeModal={handlePrivacy} />}
            </div>
            <div className="footer footer-mobile">
                <div className="d-flex gap-4">
                    <img src={ydle} />
                    <img src={allttam} />
                </div>
                <div className="footer-divider" />
                <p className="footer-contents">
                    상호명 이들 <span className="textDivider">|</span> 대표 유성용
                    <span className="textDivider">|</span>개인정보보호 책임자 유성용
                </p>
                <p className="footer-contents">
                    사업자등록번호 306-09-65729
                    <span className="textDivider">|</span> 통신판매업신고번호
                    2023-경기하남-0330
                </p>
                <p className="footer-contents">
                    주소 경기도 하남시 미사강변한강로 135 스카이폴리스 나동 743호{" "}
                    <span className="textDivider">|</span>
                </p>
                <p className="footer-contents">
                    업무시간 평일 10:00 ~ 17:00 _ 점심 12:00 ~ 14:00 토,일,공휴일 휴무 |
                    제휴 • 요청문의{" "}
                    <a className="footer-contents" href="mailto:request@allttam.com">
                        request@allttam.com
                    </a>
                </p>
                <div className="mt-4 policy-container">
                    <p className="footer-contents">
                        Copyright ⓒ 2023 allttam All Rights Reserved
                    </p>
                    <div className="policybutton-container">
                        <button
                            className="oneLine madebutton policybutton"
                            onClick={handleUsePolicy}
                        >
                            서비스이용약관
                        </button>
                        <button
                            onClick={handlePrivacy}
                            className="oneLine madebutton policybutton"
                        >
                            개인정보처리지침
                        </button>
                    </div>
                </div>
                {isUsePolicy && <TermsOfUse closeModal={handleUsePolicy} />}
                {isPrivacy && <PrivacyPolicy closeModal={handlePrivacy} />}
            </div>
        </>
    );
};