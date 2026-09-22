/** Auth domain: customers + admins. */

export type AccountType = 'admin' | 'customer';

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isBusiness?: boolean;
  businessName?: string | null;
  crNumber?: string | null;
  role?: string;
  type: AccountType;
}

export type SessionUser = CustomerUser;

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  user: SessionUser;
  accessToken: string;
  refreshToken?: string;
}

export interface CustomerLoginPayload {
  emailOrPhone: string;
  password: string;
}

export interface AdminLoginPayload {
  emailOrPhone: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  isBusiness?: boolean;
  businessName?: string;
  crNumber?: string;
}

export interface AdminStaffUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'staff';
  createdAt: string;
}
