import { WhiteBigButton } from "@/components/Button/allttamButton/WhiteBigButton";
import { ResetIcon } from "@/components/svg/ResetIcon";

export const ResetButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <WhiteBigButton onClick={onClick}>
      <ResetIcon />
      초기화
    </WhiteBigButton>
  );
};
