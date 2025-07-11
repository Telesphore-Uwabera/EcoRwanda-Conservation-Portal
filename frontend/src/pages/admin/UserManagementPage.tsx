import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
import {
  User as UserIcon,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Toaster, toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isOnline = useOfflineStatus();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [originalRole, setOriginalRole] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ranger", // Default to ranger
    location: "",
    organization: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const fetchUsers = async () => {
    console.log('Attempting to fetch users...');
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      console.log('Users fetched successfully:', response.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users. Please try again.");
      console.log('Error response from backend:', err.response);
    } finally {
      setLoading(false);
      console.log('Finished fetching users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = (user: User) => {
    setEditingUserId(user._id);
    setSelectedRole(user.role);
    setOriginalRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole("");
    setOriginalRole("");
  };

  const handleSaveRole = async (userId: string) => {
    if (!selectedRole) return;

    try {
      await api.put(`/users/${userId}/role`, { role: selectedRole });
      toast.success("User role updated successfully!");
      setEditingUserId(null);
      setSelectedRole("");
      setOriginalRole("");
      fetchUsers(); // Re-fetch users to reflect changes
    } catch (err: any) {
      console.error("Error updating user role:", err);
      toast.error(err.response?.data?.message || "Failed to update user role.");
      setSelectedRole(originalRole);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    setDeleteLoading(userId);
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully!");
      fetchUsers(); // Re-fetch users
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewUserRoleChange = (value: string) => {
    setNewUserData((prev) => ({ ...prev, role: value }));
  };

  const handleRegisterNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);

    if (newUserData.password !== newUserData.confirmPassword) {
      setRegisterError("Passwords do not match.");
      setRegisterLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = newUserData;
      await api.post('/users/register', dataToSend);
      toast.success("User registered successfully!");
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ranger",
        location: "",
        organization: "",
      });
      setIsRegistering(false);
      fetchUsers(); // Refresh the user list
    } catch (err: any) {
      console.error("Error registering new user:", err);
      setRegisterError(err.response?.data?.message || "Failed to register user.");
    } finally {
      setRegisterLoading(false);
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

  return (
    <div className="space-y-6">
      <OfflineIndicator isOnline={isOnline} />
      <Toaster position="top-center" />

      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions.
        </p>
        <Button
          onClick={() => setIsRegistering(!isRegistering)}
          variant="outline"
          className="mt-4"
        >
          {isRegistering ? "Cancel Registration" : "Register New User"}
        </Button>
      </div>

      {isRegistering && (
        <Card className="shadow-lg border border-gray-200 max-w-2xl mx-auto mt-8 p-8">
          <CardHeader className="bg-blue-50 rounded-t-xl p-6">
            <CardTitle className="flex items-center gap-4 text-3xl font-extrabold text-blue-800">
              <PlusCircle className="h-8 w-8 text-blue-700" />
              Register New User Account
            </CardTitle>
            <CardDescription className="text-blue-700 mt-3 text-lg">Empower your administration by securely creating new user accounts with tailored roles and essential details.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 bg-white rounded-b-xl">
            <form onSubmit={handleRegisterNewUser} className="space-y-6">
              {registerError && (
                <AlertDialog variant="destructive" className="bg-red-100 border-l-4 border-red-500 text-red-800 p-5 rounded-lg shadow-md">
                  <AlertTriangle className="h-7 w-7 text-red-600 mr-3" />
                  <div>
                    <AlertTitle className="text-red-900 font-bold text-xl mb-1">Registration Error</AlertTitle>
                    <AlertDescription className="text-red-800 text-lg">{registerError}</AlertDescription>
                  </div>
                </AlertDialog>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="font-bold text-gray-800 text-lg">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newUserData.firstName}
                    onChange={handleNewUserChange}
                    required
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="font-bold text-gray-800 text-lg">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newUserData.lastName}
                    onChange={handleNewUserChange}
                    required
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="font-bold text-gray-800 text-lg">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  required
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="password" className="font-bold text-gray-800 text-lg">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUserData.password}
                    onChange={handleNewUserChange}
                    required
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="font-bold text-gray-800 text-lg">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={newUserData.confirmPassword}
                    onChange={handleNewUserChange}
                    required
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="location" className="font-bold text-gray-800 text-lg">Location (Optional)</Label>
                  <Input
                    id="location"
                    name="location"
                    value={newUserData.location}
                    onChange={handleNewUserChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="organization" className="font-bold text-gray-800 text-lg">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={newUserData.organization}
                    onChange={handleNewUserChange}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="role" className="font-bold text-gray-800 text-lg">Select Role</Label>
                <Select value={newUserData.role} onValueChange={handleNewUserRoleChange}>
                  <SelectTrigger className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg text-gray-900 shadow-sm">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="ranger">Ranger</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={registerLoading} className="py-4 bg-blue-700 text-white font-extrabold text-xl uppercase tracking-wider rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 transition duration-300 ease-in-out shadow-2xl transform hover:scale-105">
                {registerLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin mr-4" />
                ) : (
                  <PlusCircle className="h-8 w-8 mr-4" />
                )}
                Register User
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center min-h-[200px] my-10">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
          <p className="ml-4 text-xl text-gray-700">Loading users...</p>
        </div>
      )}

      {error && (
        <AlertDialog variant="destructive" className="bg-red-100 border-l-4 border-red-500 text-red-800 p-5 rounded-lg shadow-md">
          <AlertTriangle className="h-7 w-7 text-red-600 mr-3" />
          <div>
            <AlertTitle className="text-red-900 font-bold text-xl mb-1">Error</AlertTitle>
            <AlertDescription className="text-red-800 text-lg">{error}</AlertDescription>
          </div>
        </AlertDialog>
      )}

      {!loading && !error && (
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="bg-gray-50 p-4 rounded-t-lg">
            <CardTitle className="text-2xl font-semibold text-gray-800">All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 font-medium text-base">Name</TableHead>
                  <TableHead className="text-gray-600 font-medium text-base">Email</TableHead>
                  <TableHead className="text-gray-600 font-medium text-base">Role</TableHead>
                  <TableHead className="text-gray-600 font-medium text-base">Verified</TableHead>
                  <TableHead className="text-gray-600 font-medium text-base">Registered On</TableHead>
                  <TableHead className="text-right text-gray-600 font-medium text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <TableCell className="font-medium text-gray-800">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-gray-700">{user.email}</TableCell>
                    <TableCell>
                      {editingUserId === user._id ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                          >
                            <SelectTrigger className="w-[180px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                              <SelectItem value="researcher">Researcher</SelectItem>
                              <SelectItem value="ranger">Ranger</SelectItem>
                              {/* Admin cannot change another admin's role or demote self */}
                              {currentUser?.id !== user._id && currentUser?.role === 'administrator' && (
                                <SelectItem value="administrator">Administrator</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-1"
                            onClick={() => handleSaveRole(user._id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-1"
                            onClick={handleCancelEdit}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.verified ? (
                        <CheckCircle className="h-6 w-6 text-green-500" title="Verified" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" title="Not Verified" />
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 px-3 py-1 text-sm"
                        onClick={() => handleEditRole(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mr-2 px-3 py-1 text-sm"
                      >
                        <Link to={`/admin/users/${user._id}`}>
                          <UserIcon className="h-4 w-4 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="px-3 py-1 text-sm"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deleteLoading === user._id}
                      >
                        {deleteLoading === user._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagementPage;