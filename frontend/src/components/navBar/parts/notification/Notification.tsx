import { NoticeIcon } from "@/components/svg/NoticeIcon";
import useUser from "@/hooks/useUser";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationType } from "../NavBarButtonTab";
import { NotificationMessage } from "./NotificationMessage";

export const Notification = () => {
    const [isNote, setIsNote] = useState(false);
    const [notification, setNotification] = useState<NotificationType[]>([]);
    const [allNote, setAllNote] = useState<NotificationType[]>([]);
    const userInfo = useUser();

    const notificationRef = useRef<any>(null);

    const clickClose = () => {
        setIsNote(false);
    };

    const toggleModal = () => {
        setIsNote((prev) => !prev);
    };

    useEffect(() => {
        const menuBarEvent = (e: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                clickClose();
            }
        };
        document.addEventListener("mousedown", menuBarEvent);

        return () => {
            document.removeEventListener("mousedown", menuBarEvent);
        };
    }, []);

    useEffect(() => {
        if (!userInfo) return;
        getMessage();
    }, [userInfo]);

    const getMessage = useCallback(async () => {
        const res1 = await axios.get(
            `https://center.allttam.com/api/allttam/notification/unread/${userInfo.username}`
        );
        const res2 = await axios.get(
            `https://center.allttam.com/api/allttam/notification/${userInfo.username}`
        );
        setNotification(res1.data);
        setAllNote(res2.data);
    }, [userInfo]);

    return (
        <div
            ref={notificationRef}
            onClick={toggleModal}
            className="madebutton relative"
        >
            <NoticeIcon />
            {notification?.length > 0 && <span className="newNotification" />}
            {isNote && (
                <NotificationMessage
                    close={toggleModal}
                    notification={notification}
                    allNote={allNote}
                    getMessage={getMessage}
                />
            )}
        </div>
    );
};