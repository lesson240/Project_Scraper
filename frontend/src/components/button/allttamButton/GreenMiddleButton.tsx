import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: JSX.Element | string;
}

export const GreenMiddleButton = ({
  onClick,
  children,
  onMouseEnter,
  onMouseLeave,
}: Props) => {
  return (
    <button
      className="allttam-button button-middle green-button madebutton"
      onClick={onClick}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </button>
  );
};
