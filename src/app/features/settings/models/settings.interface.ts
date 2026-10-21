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
  phone: string;
  role: string;
  status: string;
  updatedAt: string;
}
