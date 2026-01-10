import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true, // useful later for cookies/auth
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Optional: response interceptor (clean error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // keep the full axios error object
    return Promise.reject(error);
  }
);


export default api;
