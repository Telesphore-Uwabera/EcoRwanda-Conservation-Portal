import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Hourglass } from 'lucide-react';

const WaitingForVerification = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg text-center max-w-md">
        <Hourglass className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="text-2xl font-bold mt-4">Verification Pending</h1>
        <p className="text-gray-600 mt-2">
          Thank you for registering! Your account is currently awaiting verification
          from an administrator.
        </p>
        <p className="text-gray-600 mt-2">
          You will be able to access your dashboard once your account has been approved.
          If you have any questions, please contact our support team.
        </p>
        <Button
          onClick={handleLogout}
          className="mt-6 w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default WaitingForVerification; 