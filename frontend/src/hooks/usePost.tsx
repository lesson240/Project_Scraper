import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { AxiosError } from "axios";

export const usePost = (url: string, body: {}, onError?: (e: any) => void) => {
    const postFunction = async () => {
        try {
            const res = await axiosInstance.post(url, body);
            if (res.data.data) {
                return res.data.data;
            } else {
                return res.data;
            }
        } catch (e: any) {
            throw new Error(e.response.data);
        }
    };

    const mutateFunction = useMutation(postFunction, {
        onError,
    });

    return mutateFunction;
};
