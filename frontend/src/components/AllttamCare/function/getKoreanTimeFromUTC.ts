export function getKoreanTiemFromUTC(utcTime: string) {
    const utcDate = new Date(utcTime); // UTC 시간을 이용하여 Date 객체 생성
    const koreanTime = utcDate.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
    }); // 한국 시간 (KST)로 형식화

    const a = koreanTime.split(" ");

    return `${a[0]}${a[1]}${a[2]}`;
}