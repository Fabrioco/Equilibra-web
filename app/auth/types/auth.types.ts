export interface RegisterResponse {
  message?: string;
  errors?: Record<string, string[]>;
  user?: {
    id: string;
    email: string;
  };
}

export interface LoginResponse {
  message?: string;
  errors?: Record<string, string[]>;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    plan: string;
    privacyMode: boolean;
    enableNotifications: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
