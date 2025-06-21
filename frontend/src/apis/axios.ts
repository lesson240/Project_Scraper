import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000", //FastAPI server adress
});

export default api;