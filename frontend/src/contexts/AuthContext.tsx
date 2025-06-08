import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, User, LoginCredentials, SignupData } from "@/types/auth";
import api from "@/config/api";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check for stored auth token
    const storedUser = localStorage.getItem("eco-user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } catch {
        localStorage.removeItem("eco-user");
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Store user data and token
      const userData = { ...user, token };
      localStorage.setItem("eco-user", JSON.stringify(userData));
      
      setAuthState({
        user: userData,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      throw error;
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      await api.post('/auth/register', data);
      setAuthState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem("eco-user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
