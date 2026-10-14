export interface ConsoleUser {
  id: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

export interface AuthLoginResponse {
  accessToken: string;
  user: ConsoleUser;
}

export interface AuthContextType {
  user: ConsoleUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getInitials: () => string;
  getTimeGreeting: () => string;
  timeGreeting: string;
}
