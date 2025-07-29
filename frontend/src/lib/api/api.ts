import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

//Use if backend require AUTHORIZATION for endpoints
/*
import { getAuth } from "firebase/auth";
api.interceptors.request.use(
    async (config) => {
        const user = getAuth().currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
*/

export default api;
