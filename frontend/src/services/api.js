import axios from "axios";

const baseURL = import.meta.env.VITE_URL_API;

export const api = axios.create({ 
  baseURL,
});

let renovando = null;

const encerrarSessao = () => {
  localStorage.removeItem("@App:token");
  localStorage.removeItem("@App:refresh");
  localStorage.removeItem("@App:user");
  window.location.href = "/";
}

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
  (response) => response,
  async (error) => {
    const original = error.config;
    const url = original?.url || "";
    const rotaDeAuth = url.includes("/auth/login") || url.includes("/auth/refresh");
    if (error.response?.status === 401 && !rotaDeAuth && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("@App:refresh");
      if (!refreshToken) {
        encerrarSessao();
        return Promise.reject(error);
      }
      try {
        renovando =
          renovando ||
          axios
            .post(`${baseURL}/api/auth/refresh`, { refresh_token: refreshToken })
            .finally(() => {
              renovando = null;
            });
        const { data } = await renovando;
        localStorage.setItem("@App:token", data.access_token);
        localStorage.setItem("@App:refresh", data.refresh_token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original); // refaz a requisição que tinha falhado
      } catch (refreshError) {
        encerrarSessao();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);