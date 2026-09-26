import axios from "axios";

export const api = axios.create({

  baseURL: import.meta.env.VITE_URL_API,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@App:token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("@App:token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);