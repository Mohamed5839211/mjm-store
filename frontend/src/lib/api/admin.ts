'use client';

import { http } from '@/lib/http/client';
import type { AdminStaffUser, SessionUser } from '@/types/auth';
import type { Paginated } from '@/types/common';

export interface SalesAnalytics {
  totalRevenue: number | string;
  totalOrders: number;
  [key: string]: unknown;
}

/* ---------------- Customers (admin) ---------------- */

export function fetchAdminCustomers(): Promise<SessionUser[]> {
  return http.get<SessionUser[]>('/admin/customers');
}

export function updateAdminCustomer(id: number, payload: Record<string, unknown>): Promise<SessionUser> {
  return http.patch<SessionUser>(`/admin/customers/${id}`, payload);
}

export function deleteAdminCustomer(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/admin/customers/${id}`);
}

/* ---------------- Staff (admin) ---------------- */

export function fetchStaff(): Promise<AdminStaffUser[]> {
  return http.get<AdminStaffUser[]>('/admin/staff');
}

export function createStaff(payload: { name: string; email: string; password: string; role: string }): Promise<AdminStaffUser> {
  return http.post<AdminStaffUser>('/admin/staff', payload);
}

export function updateStaff(id: number, payload: Record<string, unknown>): Promise<AdminStaffUser> {
  return http.patch<AdminStaffUser>(`/admin/staff/${id}`, payload);
}

export function deleteStaff(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/admin/staff/${id}`);
}

/* ---------------- Analytics (admin) ---------------- */

export interface OverviewStat {
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
}

export interface SalesOverview {
  stats: OverviewStat[];
  recentActivity: ActivityItem[];
}

export interface SalesPoint {
  date: string;
  sales: number;
}

export interface SalesReport {
  range: string;
  data: SalesPoint[];
  totalSales: number;
}

export function fetchSalesOverview(): Promise<SalesOverview> {
  return http.get<SalesOverview>('/analytics/overview');
}

export function fetchSales(range = 'monthly'): Promise<SalesReport> {
  return http.get<SalesReport>(`/analytics/sales?range=${encodeURIComponent(range)}`);
}

export function fetchTopProducts(): Promise<Array<Record<string, unknown>>> {
  return http.get<Array<Record<string, unknown>>>('/analytics/top-products');
}

/* ---------------- Contact messages (admin) ---------------- */

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export function fetchContactMessages(): Promise<ContactMessage[]> {
  return http.get<ContactMessage[]>('/admin/contact');
}

export function updateContactStatus(id: number, status: string): Promise<ContactMessage> {
  return http.patch<ContactMessage>(`/admin/contact/${id}/status`, { status });
}

/* ---------------- Shipments (admin) ---------------- */

export interface Shipment {
  id: number;
  orderId: number;
  trackingNumber: string | null;
  labelUrl: string | null;
  status: string;
  provider?: { id: number; name: string } | null;
  order?: {
    id: number;
    customer?: { name: string } | null;
    address?: { city: string; district: string } | null;
  } | null;
}

export interface ShippingProvider {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

export function fetchShipments(): Promise<Paginated<Shipment>> {
  return http.get<Paginated<Shipment>>('/admin/shipments');
}

export function updateShipmentStatus(id: number, status: string): Promise<unknown> {
  return http.patch<unknown>(`/admin/shipments/${id}/status`, { status });
}

export function fetchShippingProviders(): Promise<ShippingProvider[]> {
  return http.get<ShippingProvider[]>('/admin/shipping-providers');
}

export function updateShippingProvider(id: number, payload: { isActive: boolean }): Promise<ShippingProvider> {
  return http.patch<ShippingProvider>(`/admin/shipping-providers/${id}`, payload);
}

/* ---------------- CMS content (admin) ---------------- */

export function updateCmsSettings(payload: Record<string, unknown>): Promise<unknown> {
  return http.patch<unknown>('/cms/admin/settings', payload);
}

export function updateCmsPage(slug: string, payload: Record<string, unknown>): Promise<unknown> {
  return http.patch<unknown>(`/cms/admin/pages/${slug}`, payload);
}
