import { DEFAULT_SIGNOUT_REDIRECT } from "@/routes";
import axios from "axios";

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data?.message === "ACCESS_TOKEN_NOT_VALID" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await API.post("/auth/refresh");

        return API(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = DEFAULT_SIGNOUT_REDIRECT;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;
