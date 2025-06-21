import axiosCenter from "@/utils/axiosCenter";

export const getReference = async (username: string) => {
  const { data } = await axiosCenter.get(`allttam/usercode/${username}`);

  return data;
};

export const createUserReference = async (userReference: UserReference) => {
  const { data } = await axiosCenter.post(`allttam/usercode`, userReference);
  return data;
};

interface UserReference {
  referenceCode: string;
  userId: string;
  username: string;
  userContact: string;
  userEmail: string;
}
