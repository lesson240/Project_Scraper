import axios from "axios";
import { CENTER_URL } from "@/common/baseUrl";

const axiosCenter = axios.create({
  baseURL: CENTER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosCenter;
