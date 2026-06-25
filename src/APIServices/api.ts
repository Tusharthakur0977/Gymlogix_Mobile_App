import {API_URL} from '@env';
import axios from 'axios';
import {getLocalStorageData} from '../Utilities/Storage';
import STORAGE_KEYS from '../Utilities/Constants';

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

// Create the Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token dynamically
api.interceptors.request.use(
  async config => {
    const token = await getLocalStorageData(STORAGE_KEYS.token); // Fetch token from AsyncStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.role = `user`;
      config.headers['x-client-type'] = 'mobile';
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Extract API error response
      console.error('API Error:', error.response);
      return Promise.reject({
        ...error.response.data,
        status: error.response.status,
      }); // Reject with only response data
    } else {
      // Handle network or unexpected errors
      console.error('Network/Unexpected Error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Something went wrong',
      });
    }
  },
);

// API methods with optional headers
export const fetchData = <T>(endpoint: string, params?: any, headers?: any) =>
  api.get<T>(endpoint, {params, headers});

export const postData = <T>(endpoint: string, data?: any, headers?: any) =>
  api.post<T>(endpoint, data, {headers});

export const postFormData = <T>(endpoint: string, data: FormData) =>
  api.post<T>(endpoint, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const patchData = <T>(endpoint: string, data: any, headers?: any) =>
  api.patch<T>(endpoint, data, {headers});

export const putData = <T>(endpoint: string, data: any, headers?: any) =>
  api.put<T>(endpoint, data, {headers});

export const deleteData = <T>(endpoint: string) => api.delete<T>(endpoint);

export default api;
