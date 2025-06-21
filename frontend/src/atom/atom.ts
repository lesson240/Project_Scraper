import {
    ComponentType,
    refetchIntervalLoadingProps,
} from "../interface/fqa.interface";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
import { CollectLog, UploadLog } from "../interface/defaultinterface";
import { NotificationType } from "../components/navBar/parts/NavBarButtonTab";

const { persistAtom } = recoilPersist({
    key: "localStorage",
    storage: localStorage,
});

export const translateWindowState = atom({
    key: "translateWindowState",
    default: false,
});

export const infoWindowState = atom({
    key: "infoWindowState",
    default: {
        isOpen: false,
        animation: false,
        message: ``,
    },
});

export const isHelper = atom({
    key: "isHelper",
    default: false,
});

export const helperComponent = atom<ComponentType>({
    key: "helperComponent",
    default: {
        type: "default",
        id: "",
    },
});

export const helperPrevComponentList = atom<ComponentType[]>({
    key: "helperPrevComponentList",
    default: [],
});

export const productManagePeriod = atom({
    key: "productManagePeriod",
    default: "aMonth",
});

export const allttamCare = atom({
    key: "allttamCare",
    default: false,
});

export const refetchIntervalLoading = atom<refetchIntervalLoadingProps[]>({
    key: "refetchInterval",
    default: [],
    effects_UNSTABLE: [persistAtom],
});

export const collectLogCenter = atom<CollectLog[]>({
    key: "collectLogCenter",
    default: [],
    effects_UNSTABLE: [persistAtom],
});

export const uploadLogCenter = atom<UploadLog[]>({
    key: "upLogCenter",
    default: [],
    effects_UNSTABLE: [persistAtom],
});

export const isDeskTop = atom<boolean>({
    key: "isDeskTop",
    default: true,
    effects_UNSTABLE: [persistAtom],
});