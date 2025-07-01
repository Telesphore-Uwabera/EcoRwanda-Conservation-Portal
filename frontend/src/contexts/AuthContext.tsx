import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, User, LoginCredentials, SignupData } from "@/types/auth";
import api from "@/config/api";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
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
        const userData = JSON.parse(storedUser);
        // Ensure required fields are present
        if (!userData._id || !userData.token) {
          throw new Error('Invalid user data');
        }

        // Ensure 'verified' property is correctly set
        const userWithVerified: User = {
          ...userData,
          verified: typeof userData.verified === 'boolean' ? userData.verified : false,
        };

        setAuthState({
          user: userWithVerified,
          isAuthenticated: true,
          loading: false,
        });

        // Set the token in the API client
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
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
      
      if (!user._id || !token) {
        throw new Error('Invalid response from server');
      }

      // Store user data with token
      const userData: User = {
        ...user,
        token,
        verified: typeof user.verified === 'boolean' ? user.verified : false,
      };

      localStorage.setItem("eco-user", JSON.stringify(userData));
      
      // Set the token in the API client
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuthState({
        user: userData,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
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
      console.error('Signup error:', error);
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
    // Remove the token from API client
    delete api.defaults.headers.common['Authorization'];
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const updateUser = (user: User): void => {
    const updatedUser = {
      ...user,
      verified: typeof user.verified === 'boolean' ? user.verified : false,
    };
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
    localStorage.setItem("eco-user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        updateUser,
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
