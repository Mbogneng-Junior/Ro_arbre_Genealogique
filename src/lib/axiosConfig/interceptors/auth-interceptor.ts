import {AxiosInstance, InternalAxiosRequestConfig} from "axios";

export default function authInterceptor  (axiosInstance: AxiosInstance): void
{
  axiosInstance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
      const token: string|null = localStorage.getItem("family_tree_token");

      if (token)
      {
        req.headers["Authorization"] = "Bearer " + token;
      }
      return req;
    },
    (err) => {
      return Promise.reject(err);
    }
  );
}


