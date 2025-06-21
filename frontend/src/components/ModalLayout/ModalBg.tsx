import { KeyboardEvent, useEffect } from "react";

interface Props {
    children: React.ReactNode;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

export const ModalBg = ({ children, onClick }: Props) => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return (
        <div className="modalBg" onClick={onClick}>
            {children}
        </div>
    );
};