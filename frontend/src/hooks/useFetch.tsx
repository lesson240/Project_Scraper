import { useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const useFetch = ({
    name,
    url,
    staleTime,
    enabled,
    refetchInterval,
    cacheTime,
}: {
    name: string | string[];
    url: string;
    staleTime?: number;
    enabled?: boolean;
    refetchInterval?: number;
    cacheTime?: number;
}) => {
    const getData = useCallback(async () => {
        const res = await axiosInstance.get(url);
        if (res.data.data) {
            return res.data.data;
        } else {
            return res.data;
        }
    }, [url]);

    const { data, refetch, isLoading, isError } = useQuery({
        queryKey: [name],
        queryFn: getData,
        refetchOnWindowFocus: false,
        refetchInterval: refetchInterval ?? undefined,
        retry: 0,
        staleTime: staleTime ?? 60000,
        enabled,
    });

    return [data, refetch, isLoading, isError];
};

export default useFetch;
