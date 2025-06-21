import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { infoWindowState } from "@/atom/atom";
import useAnimation from "./useAnimation";

interface TextProps {
    Text: { title: string; content: string };
}

export const useInfoWindow = () => {
    const [isInfoWindow, setIsInfoWindow] = useRecoilState(infoWindowState);

    const windowOpen = (text: string) => {
        setIsInfoWindow({
            isOpen: true,
            message: text,
            animation: true,
        });
    };

    return windowOpen;
};