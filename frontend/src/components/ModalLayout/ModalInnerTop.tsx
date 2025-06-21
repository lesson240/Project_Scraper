import { isDeskTop } from "@/atom/atom";
import { useRecoilValue } from "recoil";

interface Props {
    children: React.ReactNode;
    width?: number;
    unset?: boolean;
    fixHeight?: number;
}

export const ModalInnerTop = ({
    children,
    width,
    unset = false,
    fixHeight,
}: Props) => {
    const isDesktop = useRecoilValue(isDeskTop);
    const widthStyle = {
        width: `${isDesktop ? (width ? width : "800") : "370"}px`,
        maxWidth: `${isDesktop ? (width ? width : "800") : "370"}px`,
    };
    const unsetStyle = {
        overflow: unset ? "unset" : "",
        height: `${fixHeight ? `${fixHeight}px` : "none"}`,
    };

    return (
        <div
            style={widthStyle}
            className={`modal-dialog1 d-flex align-items-center justify-content-center`}
        >
            <div
                style={unsetStyle}
                className="modal-content modalInner"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {children}
            </div>
        </div>
    );
};