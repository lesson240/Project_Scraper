import { useState } from "react";
import { NotificationType } from "../NavBarButtonTab";
import { getKoreanTiemFromUTC } from "@/components/AllttamCare/function/getKoreanTimeFromUTC";
import useToggle from "@/hooks/useToggle";
import { NotificationModal } from "./NotificationModal";

interface Props {
  item: NotificationType;
  getMessage: () => Promise<void>;
  isAll?: boolean;
}

export const NewNoticeItem = ({ item, getMessage, isAll }: Props) => {
  const { state: isModal, handleToggle: toggleModal } = useToggle();

  return (
    <div className="d-flex align-items-center justify-content-between gap-3 mt-1">
      <div className="d-flex align-items-center gap-3">
        {item.isRead ? (
          <span className="readNote" />
        ) : (
          <span className="notificationMark" />
        )}
        <p
          className={`margin0 mt-1 pointer notificationText ${isAll ? "all-notice-item h6" : "h5"
            }`}
          onClick={toggleModal}
        >
          {item.content}
        </p>
      </div>
      <p className={`margin0 ${isAll ? "all-notice-item h6" : "h5"}`}>
        {getKoreanTiemFromUTC(item.createdAt)}
      </p>
      {isModal && (
        <NotificationModal
          closeModal={toggleModal}
          notification={item}
          getMessage={getMessage}
        />
      )}
    </div>
  );
};
