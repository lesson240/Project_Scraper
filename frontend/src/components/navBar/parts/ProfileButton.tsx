import { DefaultProfileIcon } from "../../svg/DefaultProfileIcon";
import { DownArrowIcon } from "../../svg/DownArrowIcon";
import { Menubar } from "./menuBar/Menubar";

interface Props {
    onClick: () => void;
    isNotificationBar?: boolean;
}

export const ProfileButton = ({ onClick, isNotificationBar }: Props) => {
    return (
        <div>
            <div className="profileDrop relative">
                <button className="madebutton" onClick={onClick}>
                    <DefaultProfileIcon />
                    <DownArrowIcon />
                </button>
                {isNotificationBar && <Menubar onClick={onClick} />}
            </div>
        </div>
    );
};