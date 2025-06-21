import { SearchingIcon } from "@/components/svg/SeachingIcon";

export const SearchingButton = ({ onClick }: { onClick: any }) => {
  return (
    <button className="cancel-btn save-btn" onClick={onClick}>
      <SearchingIcon />
      검색
    </button>
  );
};
