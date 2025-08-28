import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
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
export const helperComponent = atom({
    key: "helperComponent",
    default: {
        type: "default",
        id: "",
    },
});
export const helperPrevComponentList = atom({
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
export const refetchIntervalLoading = atom({
    key: "refetchInterval",
    default: [],
    effects_UNSTABLE: [persistAtom],
});
export const collectLogCenter = atom({
    key: "collectLogCenter",
    default: [],
    effects_UNSTABLE: [persistAtom],
});
export const uploadLogCenter = atom({
    key: "upLogCenter",
    default: [],
    effects_UNSTABLE: [persistAtom],
});
export const isDeskTop = atom({
    key: "isDeskTop",
    default: true,
    effects_UNSTABLE: [persistAtom],
});
