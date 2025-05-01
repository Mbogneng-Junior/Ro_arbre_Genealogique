import axios, {AxiosInstance} from "axios";
import authInterceptor from "./interceptors/auth-interceptor";
import errorInterceptor from "./interceptors/error-interceptor";



const axiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
});

authInterceptor(axiosInstance);
errorInterceptor(axiosInstance);

export default axiosInstance;