import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { getDashboardRoute, getRoleDisplayName } from "@/lib/auth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  BookOpen,
  Shield,
  UserCog,
  RefreshCw,
  FileText,
} from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as UserRole | "",
    location: "",
    organization: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const roleOptions = [
    {
      value: "volunteer" as UserRole,
      label: "Volunteer",
      description: "Report incidents, join conservation projects",
      icon: Users,
      color: "text-emerald-600",
    },
    {
      value: "researcher" as UserRole,
      label: "Researcher",
      description: "Publish findings, access data hub",
      icon: BookOpen,
      color: "text-blue-600",
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.role) {
      setError("Please select a role");
      return;
    }

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        location: formData.location || undefined,
        organization: formData.organization || undefined,
      });
      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        location: "",
        organization: "",
      });
    } catch (err: any) {
      if (err.response?.data?.message === 'User already exists') {
        setError('A user with this email already exists. Please log in or use a different email.');
      } else {
        setError("Failed to create account. Please try again.");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper to generate a strong password
  function generateStrongPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=<>?";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Add a function to check password strength
  function getPasswordStrength(password: string) {
    if (password.length < 8) return 'Too short';
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Medium';
    if (score >= 3) return 'Strong';
    return '';
  }

  // Add useEffect to update strength and match
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
    setPasswordsMatch(formData.password === formData.confirmPassword);
  }, [formData.password, formData.confirmPassword]);

  return (
    <AuthLayout
      title="Join EcoRwanda"
      subtitle="Create an account to start contributing to conservation"
    >
      {success ? (
        <div className="space-y-6 text-center">
          <div className="text-emerald-700 text-2xl font-bold">Registration successful!</div>
          <div className="text-gray-700">You can now log in with your credentials.</div>
          <Link
            to="/auth/login"
            className="inline-block mt-4 px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Go to Login
          </Link>
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
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@example.com"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a role in conservation" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="py-3"
                  >
                    <div className="flex items-center gap-3">
                      <role.icon className={`h-5 w-5 ${role.color}`} />
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Kigali, Rwanda"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization (Optional)</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) =>
                  handleInputChange("organization", e.target.value)
                }
                placeholder="Organization"
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Create password"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setFormData((prev) => ({ ...prev, password: generateStrongPassword() }))}
                  title="Generate Strong Password"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
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
              <div className="text-xs text-gray-500 mt-1">
                Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.<br />
                Example: <span className="font-mono">EcoRwanda!2024</span>
              </div>
              <div className="text-xs mt-1">
                <span className={
                  passwordStrength === 'Strong' ? 'text-green-600' :
                  passwordStrength === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }>
                  {formData.password && `Strength: ${passwordStrength}`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm password"
                required
                className="h-11"
              />
              {!passwordsMatch && (
                <div className="text-xs text-red-600 mt-1">Passwords do not match</div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || !passwordsMatch || passwordStrength !== 'Strong'}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
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
        </form>
      )}
    </AuthLayout>
  );
}
