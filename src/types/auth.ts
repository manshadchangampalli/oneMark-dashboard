export interface AdminUser {
  id:          string;
  email:       string;
  name:        string;
  lastLoginAt: string | null;
  createdAt:   string;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}
