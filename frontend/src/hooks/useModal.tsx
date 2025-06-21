import { useRecoilState } from "recoil";
import { modalAtom } from "@/atom/modalAtom";

const useModal = () => {
  const [modalValue, setModalValue] = useRecoilState(modalAtom);

  const openModal = (modalContent: React.ReactNode) => {
    setModalValue({
      isOpen: true,
      component: modalContent,
    });
  };

  const closeModal = () => {
    setModalValue({
      isOpen: false,
      component: null,
    });
  };

  return { openModal, closeModal };
};

export default useModal;
