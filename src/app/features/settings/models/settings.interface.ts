export interface UserProfileResponse {
  address: string;
  billingAddress: string | null;
  billingEmail: string | null;
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  organization: string | null;
  passwordUpdatedAt: string | null;
  phone: string;
  role: string;
  status: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  billingAddress?: string | null;
  billingEmail?: string | null;
  organization?: string | null;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
