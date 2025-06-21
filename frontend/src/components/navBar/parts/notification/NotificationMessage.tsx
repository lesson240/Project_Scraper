import useFetch from "@/hooks/useFetch";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DownArrowIcon } from "@/components/svg/DownArrowIcon";
import { NotificationType } from "../NavBarButtonTab";
import { NewNoticeItem } from "./NewNoticeItem";
import { AllNotification } from "./AllNotification";
import { NoticeIcon } from "@/components/svg/NoticeIcon";

interface Props {
    notification: NotificationType[];
    getMessage: () => Promise<void>;
    allNote: NotificationType[];
    close: () => void;
}

export const NotificationMessage = ({
    notification,
    getMessage,
    allNote,
    close,
}: Props) => {
    const [isDetailView, setIsDetailView] = useState(false);

    const clickDetail = () => {
        setIsDetailView((prev) => !prev);
    };

    return (
        <div onClick={(e) => e.stopPropagation()} className="notification-box">
            <div className="d-flex align-items-end gap-3 notificationHeader justify-content-between">
                <p className="h3 margin0">알림함</p>
                <div className="d-flex gap-1">
                    {notification.length > 0 && (
                        <>
                            <NoticeIcon width={25} height={25} color="#fff" />
                            <p className="margin0">{notification.length}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="notificationBody">
                <div className="d-flex flex-col">
                    {notification.map((item) => (
                        <NewNoticeItem key={item._id} item={item} getMessage={getMessage} />
                    ))}
                    {notification.length === 0 && (
                        <p className="h6 mt-3 textCenter">확인하지 않은 알림이 없습니다.</p>
                    )}
                </div>
                <div className="mt-4"></div>
                {!isDetailView && allNote.length > 0 && (
                    <div className="d-flex widthFull justify-content-center">
                        <button
                            onClick={clickDetail}
                            className="madebutton d-flex flex-col align-items-center"
                        >
                            <p className="margin0 h6">이전 알림 보기</p>
                            <DownArrowIcon />
                        </button>
                    </div>
                )}
                {isDetailView && (
                    <AllNotification getMessage={getMessage} allNote={allNote} />
                )}
            </div>
        </div>
    );
};