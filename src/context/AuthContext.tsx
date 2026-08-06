import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { AuthState, UserSession, LoginRequest } from '../types/auth';
import { saveSession, getSession, clearSession } from '../services/storage';
import { loginApi } from '../services/api/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUserSession: (session: Partial<UserSession>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedSession = await getSession();
        if (storedSession && storedSession.StaffID) {
          setUser(storedSession);
        }
      } catch (e) {
        console.error('Failed to load stored session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const responseData = await loginApi(credentials);

      if (!responseData) {
        throw new Error('Invalid Employee ID or Password');
      }

      // Check success flags
      const isSuccess =
        responseData.success === true ||
        responseData.Success === true ||
        responseData.data?.API_Result === 'SUCCESS' ||
        responseData.API_Result === 'SUCCESS' ||
        responseData.Status === true;

      if (!isSuccess) {
        const msg =
          responseData.errorMessage ||
          responseData.Message ||
          responseData.message ||
          'Invalid Employee ID or Password';
        throw new Error(msg);
      }

      // Extract exact data object returned by API
      const dataObj = responseData.data || responseData.Data || responseData;

      // Extract numeric Staff_ID (e.g. 290)
      let staffId = 0;
      if (dataObj.Staff_ID) staffId = Number(dataObj.Staff_ID);
      else if (dataObj.StaffID) staffId = Number(dataObj.StaffID);
      else if (dataObj.staffID) staffId = Number(dataObj.staffID);
      else if (dataObj.staff_id) staffId = Number(dataObj.staff_id);
      else if (dataObj.id) staffId = Number(dataObj.id);

      // Extract string Staff_Code (e.g. "1488")
      const staffCode = String(
        dataObj.Staff_Code ||
        dataObj.StaffCode ||
        dataObj.staffCode ||
        credentials.User_Name
      );

      // Extract numeric Login_User_ID (e.g. 752)
      let userId = staffId;
      if (dataObj.Login_User_ID) userId = Number(dataObj.Login_User_ID);
      else if (dataObj.User_ID) userId = Number(dataObj.User_ID);
      else if (dataObj.userID) userId = Number(dataObj.userID);
      else if (dataObj.UserId) userId = Number(dataObj.UserId);

      // Extract string Login_User_Name
      const staffName = String(
        dataObj.Login_User_Name ||
        dataObj.StaffName ||
        dataObj.staffName ||
        dataObj.EmployeeName ||
        dataObj.Name ||
        ''
      );

      const token = String(
        dataObj.token ||
        dataObj.Token ||
        dataObj.accessToken ||
        ''
      );

      if (!staffId || isNaN(staffId)) {
        throw new Error('Invalid Employee ID or Password');
      }

      const session: UserSession = {
        User_Name: credentials.User_Name,
        StaffID: staffId,
        StaffCode: staffCode,
        User_ID: userId,
        StaffName: staffName,
        Token: token,
        loginTime: new Date().toISOString(),
        rawResponse: responseData,
      };

      await saveSession(session);
      setUser(session);
    } catch (error) {
      await clearSession();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserSession = useCallback(async (updatedFields: Partial<UserSession>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...updatedFields };
      saveSession(updated);
      return updated;
    });
  }, []);

  // Wrap context value with useMemo to prevent continuous Fabric shadow tree re-commits
  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      isLoading,
      login,
      logout,
      updateUserSession,
    }),
    [user, isLoading, login, logout, updateUserSession]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
