interface Props {
  colSpan : number
}

export const UploadNoneResult = ({colSpan} : Props) => {
  return (
    <tr>
      <th colSpan={colSpan} className="textCenter padding200">
        <p>검색된 결과가 없습니다.</p>
      </th>
    </tr>
  );
};
