interface Props {
    width?: number;
    height?: number;
    color?: string;
}

export const NoticeIcon = ({ width, height, color }: Props) => {
    return (
        <svg
            className="pointer"
            xmlns="http://www.w3.org/2000/svg"
            width={width ? width : "36"}
            height={height ? height : "36"}
            viewBox="0 0 36 36"
        >
            <path
                d="M13.8 27.4a2.4 2.4 0 0 0 2.4-2.4h-4.8a2.4 2.4 0 0 0 2.4 2.4zm-9.6-4.8h19.2a1.2 1.2 0 0 0 .848-2.048L22.2 18.5v-6.7A8.407 8.407 0 0 0 15 3.5V2.2a1.2 1.2 0 1 0-2.4 0v1.3a8.407 8.407 0 0 0-7.2 8.3v6.7l-2.048 2.052A1.2 1.2 0 0 0 4.2 22.6zm3.248-2.752A1.2 1.2 0 0 0 7.8 19v-7.2a6 6 0 1 1 12 0V19a1.2 1.2 0 0 0 .351.848l.352.352H7.1z"
                transform="translate(4 4)"
                fill={color ? color : "#39415c"}
            ></path>
            <path data-name="사각형 3766" fill="none" d="M0 0h36v36H0z"></path>
        </svg>
    );
};