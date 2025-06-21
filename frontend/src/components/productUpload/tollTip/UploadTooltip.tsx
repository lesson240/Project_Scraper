interface Props {
  children: string;
  className?: string;
}

export const UploadTooltip = ({ children, className }: Props) => {
  return (
    <div className="tooltipAb d-flex justify-content-center">
      <div className={`${className ? className : "uploadTooltip"} oneLine`}>
        {children}
      </div>
    </div>
  );
};
