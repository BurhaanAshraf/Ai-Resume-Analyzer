import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${import.meta.env.VITE_API_URL || ""}/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .then((res) => {
            setAccessToken(res.data.accessToken);
            return res.data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const token = await refreshPromise;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
