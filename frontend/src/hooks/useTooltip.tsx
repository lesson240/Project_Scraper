import { useState } from "react";

export const useTooltip = (): [boolean, () => void, () => void] => {
  const [isTooltipVisible, setTooltipVisible] = useState<boolean>(false);

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return [isTooltipVisible, handleMouseEnter, handleMouseLeave];
};
