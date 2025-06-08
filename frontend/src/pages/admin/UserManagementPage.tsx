import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "ranger", // Default to ranger
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
  };

  const handleSaveRole = async (userId: string) => {
    if (!selectedRole) return;

    try {
      await api.put(`/users/${userId}/role`, { role: selectedRole });
      toast.success("User role updated successfully!");
      setEditingUserId(null);
      fetchUsers(); // Re-fetch users to reflect changes
    } catch (err: any) {
      console.error("Error updating user role:", err);
      toast.error(err.response?.data?.message || "Failed to update user role.");
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
    try {
      await api.post('/users/register', newUserData);
      toast.success("User registered successfully!");
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "ranger",
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
    <div className="space-y-6 p-4">
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
        <Card className="mb-6 p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-green-600" />
              Register New User
            </CardTitle>
            <CardDescription>Create a new user account with a specific role.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterNewUser} className="space-y-4">
              {registerError && (
                <AlertDialog variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>{registerError}</AlertDescription>
                </AlertDialog>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newUserData.firstName}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newUserData.lastName}
                    onChange={handleNewUserChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUserData.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserData.role} onValueChange={handleNewUserRoleChange}>
                  <SelectTrigger>
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
              <Button type="submit" disabled={registerLoading}>
                {registerLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <PlusCircle className="h-4 w-4 mr-2" />
                )}
                Register User
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="ml-2 text-gray-700">Loading users...</p>
        </div>
      )}

      {error && (
        <AlertDialog variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </AlertDialog>
      )}

      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingUserId === user._id ? (
                        <Select
                          value={selectedRole}
                          onValueChange={setSelectedRole}
                        >
                          <SelectTrigger className="w-[180px]">
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
                      ) : (
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      {editingUserId === user._id ? (
                        <Button
                          size="sm"
                          onClick={() => handleSaveRole(user._id)}
                          disabled={!selectedRole || deleteLoading === user._id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(user)}
                          disabled={deleteLoading === user._id || user.role === 'administrator'} // Disable edit for administrators
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit Role
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deleteLoading === user._id || user.role === 'administrator'} // Prevent deleting administrators
                      >
                        {deleteLoading === user._id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {users.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500 mt-4">No users found.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagementPage; 