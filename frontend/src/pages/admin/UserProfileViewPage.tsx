import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck, UserX, ArrowLeft } from "lucide-react";
import api from "@/config/api";
import { toast } from "sonner";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/auth";

const UserProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();
  const { user: currentUser, updateUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingVerification, setTogglingVerification] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID not provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });
        setUser(response.data);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.response?.data?.message || "Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser?.token]);

  const handleToggleVerification = async (newVerifiedStatus: boolean) => {
    if (!user) return;
    setTogglingVerification(true);
    try {
      const response = await api.put(`/users/${user._id}/verify`, { verified: newVerifiedStatus }, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      setUser(prev => prev ? { ...prev, verified: response.data.user.verified } : null);
      if (currentUser?._id === user._id) {
        updateUser({ ...currentUser, verified: response.data.user.verified });
      }
      toast.success(`User account ${newVerifiedStatus ? 'verified' : 'unverified'} successfully!`);
    } catch (err: any) {
      console.error("Error toggling verification:", err);
      toast.error(err.response?.data?.message || "Failed to update verification status.");
    } finally {
      setTogglingVerification(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "volunteer":
        return "bg-emerald-100 text-emerald-800";
      case "researcher":
        return "bg-blue-100 text-blue-800";
      case "ranger":
        return "bg-purple-100 text-purple-800";
      case "administrator":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        <p className="ml-4 text-xl text-gray-700">Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        <p>{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to User Management
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>User not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to User Management
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OfflineIndicator isOnline={isOnline} />
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to User Management
      </Button>
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-50 p-6 rounded-t-lg flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              User Profile: {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Detailed view of {user.firstName}'s account information.
            </CardDescription>
          </div>
          <Badge
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getRoleColor(user.role)}`}
          >
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Email:</h3>
              <p className="text-gray-900 text-lg">{user.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Registered On:</h3>
              <p className="text-gray-900 text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {(user.location || user.organization) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.location && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Location:</h3>
                  <p className="text-gray-900 text-lg">{user.location}</p>
                </div>
              )}
              {user.organization && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Organization:</h3>
                  <p className="text-gray-900 text-lg">{user.organization}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <Label htmlFor="verification-status" className="text-base">Verification Status:</Label>
              <Switch
                id="verification-status"
                checked={user.verified}
                onCheckedChange={handleToggleVerification}
                disabled={togglingVerification}
              />
              {togglingVerification && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </div>
            <p className="text-sm text-gray-600">
              {user.verified ? "This user's account is verified." : "This user's account is currently pending verification."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileViewPage; 