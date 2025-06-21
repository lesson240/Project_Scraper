import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { NotificationType } from "../NavBarButtonTab";
import axios from "axios";
import { useEffect } from "react";
import { getKoreanTiemFromUTC } from "@/components/AllttamCare/function/getKoreanTimeFromUTC";

interface Props {
    closeModal: () => void;
    notification: NotificationType;
    getMessage: () => Promise<void>;
}

export const NotificationModal = ({
    closeModal,
    notification,
    getMessage,
}: Props) => {
    useEffect(() => {
        readNotice();
        return () => {
            getMessage();
        };
    }, []);

    const readNotice = async () => {
        if (!notification.isRead) {
            const res = await axios.patch(
                `https://center.allttam.com/api/allttam/notification/${notification._id}`
            );
        }
    };

    return (
        <ModalBg onClick={closeModal}>
            <ModalInnerTop>
                <>
                    <div className="modal-header modal-sticky">
                        <h1 className="h1 d-flex align-items-center">알림 메세지</h1>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={closeModal}
                        ></button>
                    </div>
                    <div className="modal-body inquiries-body1">
                        <div className="row">
                            <div className="col-12">
                                <h3 className="h2">알림내용</h3>
                                <div className="d-flex align-items-center gap-3">
                                    <h6 className="margin0 h5">관리자</h6>
                                    <p className="margin0 h5">
                                        {getKoreanTiemFromUTC(notification.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col-12">
                                <h5 className="noticeContents h2">{notification.content}</h5>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                                    <button onClick={closeModal} className="cancel-btn save-btn">
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            </ModalInnerTop>
        </ModalBg>
    );
};