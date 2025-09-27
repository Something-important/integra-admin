export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  displayName?: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  role: 'admin' | 'user' | 'investor';
  totalInvestments: string; // ETH amount
  propertiesOwned: number;
  joinDate: string; // ISO date string
  lastActive?: string; // ISO date string
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_required';
  profileImage?: string;
  bio?: string;
  location?: string;
  investmentPreferences?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    discord?: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  walletAddress: string;
  email?: string;
  displayName?: string;
  role?: 'admin' | 'user' | 'investor';
  bio?: string;
  location?: string;
  investmentPreferences?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  displayName?: string;
  status?: 'active' | 'pending' | 'suspended' | 'rejected';
  role?: 'admin' | 'user' | 'investor';
  bio?: string;
  location?: string;
  investmentPreferences?: string[];
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_required';
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'pending' | 'suspended' | 'rejected';
  role?: 'admin' | 'user' | 'investor';
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_required';
  limit?: number;
  offset?: number;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  total?: number;
  error?: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
}