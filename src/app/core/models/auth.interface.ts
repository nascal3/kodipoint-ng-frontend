export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupResponse {
  user: User;
  accessToken: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  message: string;
  error: string;
  details: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}
