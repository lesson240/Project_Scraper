import { NavBarButtonTab } from "./parts/NavBarButtonTab";
import useToggle from "@/hooks/useToggle";
import "./NavBar.css";
import useFetch from "@/hooks/useFetch";
import { AgreeGuard } from "@/components/guard/AgreeGuard";
// import { upload } from "@/utils/functions/postApi"; 미구현
import { memo } from "react";
import useUser from "@/hooks/useUser";
import { useRecoilValue } from "recoil";
import { isDeskTop } from "@/atom/atom";

interface Props {
    children: React.ReactNode;
}

const NavBar = ({ children }: Props) => {
    const userInfo = useUser();
    const { state: isNotificationBar, handleToggle: setIsNotificationBar } =
        useToggle();

    return (
        <div className="navAlign">
            {userInfo && !userInfo?.isAgreeTerms && <AgreeGuard />}
            <div className="col-11 col-md-6 mr-2">{children}</div>
            <NavBarButtonTab
                setIsNotificationBar={setIsNotificationBar as () => void}
                isNotificationBar={isNotificationBar}
            />
        </div>
    );
};

export default memo(NavBar);