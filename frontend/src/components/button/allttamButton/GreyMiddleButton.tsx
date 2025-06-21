interface Props {
  onClick?: () => void;
  children: string | JSX.Element;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const GreyMiddleButton = ({
  onClick,
  children,
  onMouseEnter,
  onMouseLeave,
}: Props) => {
  return (
    <button
      className="gray-button allttam-button button-middle madebutton"
      onClick={onClick}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </button>
  );
};
