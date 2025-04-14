import axios from "axios";

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
};

const API = axios.create(options);

// export const APIRefresh = axios.create(options);
// APIRefresh.interceptors.response.use((response) => response);

// API.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const { data, status } = error.response;
//     console.log(data, status, '===========================');

//     if (data.message === "VALID_TOKEN_NOT_FOUND" && status === 401) {
//       try {
//         await APIRefresh.get("/auth/refresh");
//         return APIRefresh(error.config);
//       } catch {
//         // window.location.href = "/";
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default API;
