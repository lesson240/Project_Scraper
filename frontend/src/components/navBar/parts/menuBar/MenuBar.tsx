import useModal from "@/hooks/useModal";
import Cookies from "js-cookie";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReferenceCodeSettingModal from "./modal/ReferenceCodeSettingModal";

interface Props {
  onClick: () => void;
}

export const Menubar = ({ onClick }: Props) => {
  const queryClient = useQueryClient();
  const menuRef = useRef<any>(null);

  useEffect(() => {
    const menuBarEvent = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClick();
      }
    };
    document.addEventListener("mousedown", menuBarEvent);
    return () => {
      document.removeEventListener("mousedown", menuBarEvent);
    };
  }, []);

  const navigate = useNavigate();

  const navigateTo = (link: string) => {
    navigate(link);
  };

  const clickLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    navigate("/login");
    queryClient.resetQueries();
  };

  const { openModal } = useModal();

  return (
    <div className="navButtonBox" ref={menuRef}>
      <button
        onClick={() => {
          navigateTo("/userinfo");
        }}
        className="madebutton d-flex gap-3 buttonTabText d-flex"
      >
        <p className="oneLine margin0">계정정보</p>
      </button>
      <button
        onClick={() => openModal(<ReferenceCodeSettingModal />)}
        className="madebutton d-flex gap-3 buttonTabText"
      >
        <p className="oneLine margin0">추천인 입력</p>
      </button>
      <button
        onClick={() => {
          navigateTo("/payment");
        }}
        className="madebutton d-flex gap-3 buttonTabText"
      >
        <p className="oneLine margin0">결제하기</p>
      </button>
      <button
        onClick={() => {
          navigateTo("/payment/log");
        }}
        className="madebutton d-flex gap-3 buttonTabText"
      >
        <p className="oneLine margin0">결제내역</p>
      </button>
      <button
        onClick={() => {
          navigateTo("/inquiries");
        }}
        className="madebutton d-flex gap-3 buttonTabText"
      >
        <p className="oneLine margin0">문의사항</p>
      </button>
      <button
        onClick={clickLogout}
        className="buttonTabText madebutton d-flex gap-3"
      >
        <p className="oneLine margin0">로그아웃</p>
      </button>
    </div>
  );
};
