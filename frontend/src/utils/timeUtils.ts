// src/utils/timeUtils.ts

/**
 * 초를 MM:SS 형식으로 포맷팅
 * @param seconds 초 단위 시간
 * @returns MM:SS 형식의 문자열
 */
export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 초를 HH:MM:SS 형식으로 포맷팅
 * @param seconds 초 단위 시간
 * @returns HH:MM:SS 형식의 문자열
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
