import { memo, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { infoWindowState } from "@/atom/atom";

const useAnimation = () => {
    const [isInfoWindow, setIsInfoWindow] = useRecoilState(infoWindowState);
    useEffect(() => {
        if (isInfoWindow.isOpen) {
            const timeout = setTimeout(() => {
                setIsInfoWindow((prev) => {
                    return {
                        ...prev,
                        animation: false,
                    };
                });
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [isInfoWindow.isOpen]);

    useEffect(() => {
        if (!isInfoWindow.animation) {
            setTimeout(() => {
                setIsInfoWindow({
                    isOpen: false,
                    message: "",
                    animation: false,
                });
            }, 500);
        }
    }, [isInfoWindow.animation]);
};

export default useAnimation;