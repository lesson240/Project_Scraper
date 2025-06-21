export interface FqaCategory {
    _id: string;
    title: string;
}

export interface HelperIndexType {
    default: React.ReactNode;
    category: React.ReactNode;
    detail: React.ReactNode;
}

export type IndexType =
    | "default"
    | "detail"
    | "category"
    | "search"
    | "inquiry";

export interface ComponentType {
    type: IndexType;
    id: string;
}
export interface refetchIntervalLoadingProps {
    workNum: number;
    isLoading: boolean;
}

export interface Fqa {
    categoryId: string;
    contents: string;
    createdAt: string;
    isFrequency: boolean;
    title: string;
    _id: string;
}