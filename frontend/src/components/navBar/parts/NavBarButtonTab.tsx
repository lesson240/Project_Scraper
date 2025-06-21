import { ProfileButton } from "./ProfileButton";
import { Notification } from "./notification/Notification";
import { FiAlignJustify } from "react-icons/fi";
import mobileMenu from "@/assets/images/landing/responsibility/menuBar.svg";
import { useEffect } from "react";
import useToggle from "@/hooks/useToggle";
import { MobileMainMenu } from "@/pages/landing/landingNav/MoblieMainMenu";

interface Props {
    setIsNotificationBar: () => void;
    isNotificationBar: boolean;
}

export const NavBarButtonTab = ({
    setIsNotificationBar,
    isNotificationBar,
}: Props) => {
    const {
        state: isMobileMenuBar,
        handleToggle: toggleMobileMenu,
        handleAnimation: handleAnimtaion,
        animate: toggleAnimate,
    } = useToggle();

    useEffect(() => {
        if (isMobileMenuBar) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isMobileMenuBar]);

    const openSidebar = () => {
        handleAnimtaion();
        toggleMobileMenu();
    };

    return (
        <div className="width20 btn-tab">
            <div className="gap-3 align-items-center justify-content-end desktop-btn">
                <div className="align-items-center gap-3 relative">
                    <Notification />
                </div>
                <ProfileButton
                    onClick={setIsNotificationBar}
                    isNotificationBar={isNotificationBar}
                />
            </div>
            <div className="moblie-btn align-items-center justify-content-end ">
                <button className="madebutton landing-mobile-nav" onClick={openSidebar}>
                    <img src={mobileMenu} />
                </button>
            </div>
            {isMobileMenuBar && (
                <MobileMainMenu
                    closeModal={toggleMobileMenu}
                    isMobileMenuBar={isMobileMenuBar}
                    animate={toggleAnimate}
                    handleAnimtaion={handleAnimtaion}
                />
            )}
        </div>
    );
};

export interface NotificationType {
    content: string;
    createdAt: string;
    isRead: boolean;
    _id: string;
}