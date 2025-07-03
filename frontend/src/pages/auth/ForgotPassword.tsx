import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthLayout } from "@/components/layout/AuthLayout";
import api from "@/config/api";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Replace with the actual backend API endpoint for forgot password
      await api.post("/auth/forgot-password", { email });
      setMessage("If an account with that email exists, a password reset link has been sent to the inbox.");
      toast.success("Password reset request sent!");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Failed to send password reset link. Please try again.");
      toast.error(err.response?.data?.message || "Failed to send password reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter the email to receive a password reset link."
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

        <Button
          type="submit"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
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