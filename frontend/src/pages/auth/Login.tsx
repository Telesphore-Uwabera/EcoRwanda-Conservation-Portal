import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardRoute } from "@/lib/auth";
import { AlertCircle, Eye, EyeOff, FileText } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });

      // Get user role and redirect to appropriate dashboard
      const storedUser = localStorage.getItem("eco-user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        navigate(getDashboardRoute(user.role));
      }
    } catch (err: any) {
      if (err.response && err.response.data.errorCode === 'ACCOUNT_NOT_VERIFIED') {
        navigate('/auth/waiting-for-verification');
      } else if (err.response?.data?.message === 'Invalid credentials') {
        setError(
          <>No account found with this email or password is incorrect. If you don't have an account, please <Link to="/auth/signup" className="text-emerald-600 underline">sign up here</Link>.</>
        );
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue conservation work"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="text-right text-sm">
          <Link
            to="/auth/forgot-password"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <div className="text-center">
          <Link
            to="/auth/signup"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
      <div className="text-center mt-4">
        <Link
          to="/terms-and-conditions"
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText className="h-3 w-3" />
          Terms & Conditions
        </Link>
      </div>
    </AuthLayout>
  );
}
