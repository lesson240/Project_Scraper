import { useState } from "react";

interface UseAlertReturn {
  isAlert: boolean;
  alertMessage: string;
  handleAlert: (message: string) => void;
}

export const useAlert = (): UseAlertReturn => {
  const [isAlert, setIsAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const handleAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlert((prev) => !prev);
  };

  return { isAlert, alertMessage, handleAlert };
};
