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
    const requestUrl = error.config?.url || "";

    if (error.response && error.response.status === 401 && !requestUrl.includes('/login')) {
      localStorage.removeItem("@App:token");
      localStorage.removeItem("@App:user"); 
      window.location.href = "/login"; 
    }
    
    return Promise.reject(error);
  }
);