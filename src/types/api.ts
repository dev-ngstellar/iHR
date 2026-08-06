export interface ApiResponse<T = any> {
  Status?: boolean | string | number;
  Message?: string;
  Data?: T;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  data?: any;
}
