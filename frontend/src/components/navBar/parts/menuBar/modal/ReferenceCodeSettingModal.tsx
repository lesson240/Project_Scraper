import { GreenMiddleButton } from "@/components/button/allttamButton/GreenMiddleButton";
import { GreyMiddleButton } from "@/components/button/allttamButton/GreyMiddleButton";
import ModalContent from "@/components/shared/modal/ModalContent";
import useFetch from "@/hooks/useFetch";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import useModal from "@/hooks/useModal";
import useUser from "@/hooks/useUser";
import axiosCenter from "@/utils/axiosCenter";
import { AxiosError } from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserReference, getReference } from "@/apis/referenceApi";

// 1. 서버에서 내려오는 데이터 타입 명시
type ReferenceCodeData = { referenceCode: string };

const ReferenceCodeSettingModal = () => {
  const openWindow = useInfoWindow();
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);
  const userInfo = useUser();

  // 2. useQuery에 제네릭 타입 명시
  const { data: referenceCode, isLoading } = useQuery<ReferenceCodeData>({
    queryKey: ["referenceCode", userInfo?.username],
    queryFn: () => getReference(userInfo?.username),
    enabled: !!userInfo?.username,
  });


  const [editReferenceCodeValue, setEditReferenceCodeValue] = useState("");

  const { closeModal } = useModal();

  const inputReferenceCode = (e: ChangeEvent<HTMLInputElement>) => {
    setEditReferenceCodeValue(e.target.value);
  };

  useEffect(() => {
    // 3. 안전하게 옵셔널 체이닝 사용
    if (!referenceCode?.referenceCode) return;
    setEditReferenceCodeValue(referenceCode.referenceCode);
  }, [referenceCode]);

  const submitForm = async () => {
    try {
      const userCode = await createUserReference({
        referenceCode: editReferenceCodeValue,
        userId: userInfo.username,
        username: userInfo.originalUserName,
        userContact: userInfo.userTelNo,
        userEmail: userInfo.userEmail,
      });
      queryClient.invalidateQueries({
        queryKey: ["referenceCode", userInfo?.username],
      });
      openWindow("추천인 코드가 등록되었습니다.");
      setIsEdit(false);
    } catch (err: any) {
      if (err.response.data.message) {
        return openWindow(err.response.data.message);
      }
    }
  };

  return (
    <ModalContent width={400}>
      <ModalContent.ModalHead>추천인 코드 입력</ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <p className="weight500 grey text14 margin0 mb-2">추천인코드</p>
        {(!referenceCode?.referenceCode || isEdit) ? (
          <div className="d-flex gap-3">
            <input
              className="allttam-input input-border-2 mb-4"
              value={editReferenceCodeValue}
              onChange={inputReferenceCode}
            />
            <GreenMiddleButton onClick={submitForm}>저장</GreenMiddleButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between items-center my-3">
            <p className="weight700 text20">{referenceCode?.referenceCode}</p>
            <GreenMiddleButton onClick={() => setIsEdit(true)}>
              수정
            </GreenMiddleButton>
          </div>
        )}

        <div className="d-flex gap-3 justify-content-center">
          <GreyMiddleButton onClick={closeModal}>닫기</GreyMiddleButton>
        </div>
      </ModalContent.ModalBody>
    </ModalContent>
  );
};

export default ReferenceCodeSettingModal;
