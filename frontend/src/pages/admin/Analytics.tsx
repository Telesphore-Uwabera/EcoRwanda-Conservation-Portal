import React, { useEffect, useState } from 'react';
import api from "@/config/api";

const Analytics: React.FC = () => {
  const [completedPatrols, setCompletedPatrols] = useState(0);

  // Fetch completed patrols for admin
  useEffect(() => {
    const fetchCompletedPatrols = async () => {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }
      const response = await api.get('/patrols', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patrols = response.data.patrols || [];
      setCompletedPatrols(patrols.filter(p => p.status === 'completed').length);
    };
    fetchCompletedPatrols();
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default Analytics; 