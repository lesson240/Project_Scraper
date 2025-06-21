import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/apis/authApis";

const useUser = () => {
    const { data } = useQuery({
        queryKey: ["user"],
        queryFn: getUser,
        staleTime: 60000,
    });
    return data;
};

export default useUser;
