'use client';

import { http } from '@/lib/http/client';
import type {
  AdminLoginPayload,
  CustomerLoginPayload,
  LoginResponse,
  RegisterPayload,
  SessionUser,
} from '@/types/auth';

/** POST /auth/register */
export function registerCustomer(payload: RegisterPayload): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/register', payload, { anonymous: true });
}

/** POST /auth/login */
export function loginCustomer(payload: CustomerLoginPayload): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/login', payload, { anonymous: true });
}

/** POST /auth/admin/login */
export function loginAdmin(payload: AdminLoginPayload): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/admin/login', payload, { anonymous: true });
}

/** GET /auth/me */
export function fetchMe(): Promise<SessionUser> {
  return http.get<SessionUser>('/auth/me');
}

/** PATCH /auth/profile */
export function updateProfile(payload: {
  name?: string;
  phone?: string;
  businessName?: string;
  crNumber?: string;
}): Promise<SessionUser> {
  return http.patch<SessionUser>('/auth/profile', payload);
}

/** POST /auth/change-password */
export function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  return http.post<{ message: string }>('/auth/change-password', payload);
}
