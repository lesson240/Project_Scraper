interface Props {
  width?: string;
  height?: string;
  color?: string;
}

export const SearchingIcon = ({ width, height, color }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : "24"}
      height={height ? height : "24"}
      viewBox="0 0 24 24"
    >
      <path
        d="m20.71 19.29-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 1 0 1.42-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"
        fill={color ? color : "#fff"}
        data-name="Layer 2"
      ></path>
      <path data-name="사각형 3808" fill="none" d="M0 0h24v24H0z"></path>
    </svg>
  );
};
