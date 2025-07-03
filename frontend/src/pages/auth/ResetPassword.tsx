import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthLayout } from "@/components/layout/AuthLayout";
import api from "@/config/api";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please use the link from the email.");
      toast.error("No reset token provided.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      toast.error("Invalid or missing reset token.");
      setLoading(false);
      return;
    }

    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword });
      setMessage("Password has been reset successfully! You can now log in.");
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/auth/login"), 3000); // Redirect to login after 3 seconds
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the new password below."
    >
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-800">Success</AlertTitle>
            <AlertDescription className="text-emerald-700">
              {message}
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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

        <Button
          type="submit"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>

        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
} 