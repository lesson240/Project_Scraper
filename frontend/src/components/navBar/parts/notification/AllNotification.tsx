import { useEffect, useState } from "react";
import { NotificationType } from "../NavBarButtonTab";
import axios from "axios";
import useFetch from "@/hooks/useFetch";
import { getKoreanTiemFromUTC } from "@/components/AllttamCare/function/getKoreanTimeFromUTC";
import useToggle from "@/hooks/useToggle";
import { NotificationModal } from "./NotificationModal";
import { NewNoticeItem } from "./NewNoticeItem";

interface Props {
    getMessage: () => Promise<void>;
    allNote: NotificationType[];
}
export const AllNotification = ({ getMessage, allNote }: Props) => {
    return (
        <div className="all-notice-box">
            {allNote.map((item) => (
                <NewNoticeItem getMessage={getMessage} item={item} isAll={true} />
            ))}
        </div>
    );
};