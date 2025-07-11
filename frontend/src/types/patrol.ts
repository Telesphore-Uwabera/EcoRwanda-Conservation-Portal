export interface Patrol {
  _id: string;
  route: string;
  status: 'in_progress' | 'scheduled' | 'completed' | 'cancelled';
  duration?: string;
  findings?: string;
  ranger: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  patrolDate: string;
  createdAt: string;
  updatedAt: string;
  incidents?: any[];
  startTime?: string;
  endTime?: string;
  assignedRanger?: string;
  partner?: string;
  estimatedDuration?: string;
  priority?: 'high' | 'medium' | 'low';
  objectives?: string[];
  equipment?: string[];
  notes?: string;
} 