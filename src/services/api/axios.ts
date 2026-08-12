import { create, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../../constants/config';
import { ApiError } from '../../types/api';

const axiosInstance = create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (__DEV__) {
      console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API REQUEST ERROR]', error);
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data.success);
    }
    return response;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('[API RESPONSE ERROR]', error.config?.url, error.response?.status, error.response?.data || error.message);
    }

    const formattedError: ApiError = {
      message: 'An unexpected network error occurred.',
      status: error.response?.status,
      data: error.response?.data,
    };

    if (error.code === 'ECONNABORTED') {
      formattedError.message = 'Server request timed out. Please try again.';
    } else if (error.response) {
      if (error.response.status === 401) {
        formattedError.message = 'Unauthorized session. Please log in again.';
      } else if (error.response.status === 403) {
        formattedError.message = 'Access Denied. You do not have permission for this resource.';
      } else if (error.response.status === 404) {
        formattedError.message = 'Requested API resource was not found.';
      } else if (error.response.status >= 500) {
        formattedError.message = 'Server internal error (500). Please try again later.';
      } else {
        const respMsg = (error.response.data as any)?.Message || (error.response.data as any)?.message;
        if (respMsg) {
          formattedError.message = respMsg;
        }
      }
    } else if (error.request) {
      formattedError.message = 'Network error: Cannot reach server. Please check your internet connection.';
    }

    return Promise.reject(formattedError);
  }
);

export default axiosInstance;
