export interface LoginRequest {
  User_Name: string;
  User_Password: string;
}

export interface UserSession {
  User_Name: string;
  StaffID: number;
  StaffCode?: string;
  User_ID?: number;
  StaffName?: string;
  Token?: string;
  loginTime: string;
  rawResponse?: Record<string, any>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
  isLoading: boolean;
}
