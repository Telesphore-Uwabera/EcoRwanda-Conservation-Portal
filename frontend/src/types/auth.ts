export type UserRole = "volunteer" | "researcher" | "ranger" | "administrator";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  token?: string;
  createdAt: string;
  location?: string;
  organization?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  organization?: string;
}

export interface WildlifeReport {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  photos: string[];
  category:
    | "poaching"
    | "habitat_destruction"
    | "wildlife_sighting"
    | "human_wildlife_conflict"
    | "other";
  urgency: "low" | "medium" | "high" | "critical";
  status: "pending" | "verified" | "investigating" | "resolved";
  submittedBy: string;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  leadResearcher: string;
  organization: string;
  status: "planning" | "active" | "data_collection" | "analysis" | "completed";
  volunteers: string[];
  requiredSkills: string[];
  location: string;
  startDate: string;
  endDate?: string;
  findings?: string;
}

export interface ConservationProject {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: string;
  volunteers: string[];
  impact: {
    treesPlanted?: number;
    wildlifeProtected?: number;
    areaRestored?: number;
  };
  status: "active" | "completed" | "planning";
  startDate: string;
  endDate?: string;
}
