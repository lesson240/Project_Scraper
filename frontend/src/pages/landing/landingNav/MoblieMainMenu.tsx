import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import useUser from "@/hooks/useUser";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  closeModal: () => void;
  isMobileMenuBar: boolean;
  animate: boolean;
  handleAnimtaion: () => void;
}

const routerPath = {
  home: { index: 0, path: "/home" },
  ordermanage: { index: 1, path: "/ordermanage" },
  payment: { index: 2, path: "/payment" },
  userinfo: { index: 3, path: "/userinfo" },
  adminUser: { index: 4, path: "/admin/user" },
  adminNotice: { index: 5, path: "/admin/notice" },
  adminInquiry: { index: 6, path: "/admin/inquiry" },
  admin: { index: 7, path: "/admin" },
};

export const MobileMainMenu = ({
  closeModal,
  isMobileMenuBar,
  animate,
  handleAnimtaion,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActvie] = useState<number>(-1);
  const [popUp, setPopUp] = useState<boolean>(false);
  const userInfo = useUser();
  const queryClient = useQueryClient();

  const clickNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const clickLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    navigate("/login");
    queryClient.resetQueries();
  };

  useEffect(() => {
    location.pathname.includes("admin") && setActvie(routerPath.admin.index);
    location.pathname === routerPath.home.path &&
      setActvie(routerPath.home.index);
    location.pathname === routerPath.ordermanage.path &&
      setActvie(routerPath.ordermanage.index);
    location.pathname === routerPath.payment.path &&
      setActvie(routerPath.payment.index);
    location.pathname === routerPath.userinfo.path &&
      setActvie(routerPath.userinfo.index);
    location.pathname === routerPath.adminUser.path &&
      (setActvie(routerPath.adminUser.index), setPopUp(true));
    location.pathname === routerPath.adminNotice.path &&
      (setActvie(routerPath.adminNotice.index), setPopUp(true));
    location.pathname === routerPath.adminInquiry.path &&
      (setActvie(routerPath.adminInquiry.index), setPopUp(true));
  }, [location.pathname]);

  const onClose = () => {
    handleAnimtaion();
    setTimeout(() => {
      closeModal();
    }, 500);
  };

  return (
    <>
      <>
        <div
          className={`mobile-menu-bar ${animate ? "slide-in" : "slide-out"}`}
        >
          <button
            className={`mobile-menu-bar-btn weight400 ${active === 0 ? "active-color" : ""
              }`}
            onClick={() => clickNavigate("/home")}
          >
            HOME
          </button>
          {/* <button
            className="mobile-menu-bar-btn weight400"
            onClick={() => clickNavigate("/productmanage")}
          >
            상품관리
          </button> */}
          <button
            className={`mobile-menu-bar-btn weight400 ${active === 1 ? "active-color" : ""
              }`}
            onClick={() => clickNavigate("/ordermanage")}
          >
            주문관리
          </button>
          <button
            className={`mobile-menu-bar-btn weight400 ${active === 2 ? "active-color" : ""
              }`}
            onClick={() => clickNavigate("/payment")}
          >
            코인결제소
          </button>
          <button
            className={`mobile-menu-bar-btn weight400 ${active === 3 ? "active-color" : ""
              }`}
            onClick={() => clickNavigate("/userinfo")}
          >
            결제정보
          </button>
          <hr />

          {userInfo?.role === "Admin" && (
            <ul className="d-flex flex-column">
              <li>
                <button
                  className={`mobile-menu-bar-btn weight400`}
                  onClick={() => setPopUp((prev) => !prev)}
                >
                  관리자
                </button>
                <ul className={`${popUp ? "active-block" : ""}`}>
                  <li>
                    <button
                      className={`mobile-menu-bar-btn weight400 ${active === 4 ? "active-color" : ""
                        }`}
                      onClick={() => clickNavigate("/admin/user")}
                    >
                      유저관리
                    </button>
                  </li>
                  <li>
                    <button
                      className={`mobile-menu-bar-btn weight400 ${active === 5 ? "active-color" : ""
                        }`}
                      onClick={() => clickNavigate("/admin/notice")}
                    >
                      공지사항
                    </button>
                  </li>
                  <li>
                    <button
                      className={`mobile-menu-bar-btn weight400 ${active === 6 ? "active-color" : ""
                        }`}
                      onClick={() => clickNavigate("/admin/inquiry")}
                    >
                      문의사항
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
          <div className="mobile-menu-bar-logout-layout">
            <button
              className={`mobile-menu-bar-btn weight400 mobile-menu-bar-logout-btn`}
              onClick={() => clickLogout()}
            >
              로그아웃
            </button>
          </div>
        </div>

        <div
          className={`menuoutside ${animate ? "fade-in" : "fade-out"}`}
          aria-hidden={true}
          onClick={onClose}
        ></div>
      </>
    </>
  );
};
