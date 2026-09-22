'use client';

import { http } from '@/lib/http/client';
import type { Paginated } from '@/types/common';
import type {
  Address,
  AddressPayload,
  CheckoutPayload,
  ContactPayload,
  Invoice,
  Order,
  OrderStatus,
  PrintingRequest,
  PrintingRequestPayload,
  ShippingZone,
  SupportTicket,
  WaterSubscription,
  WaterSubscriptionPayload,
} from '@/types/commerce';

/* ---------------- Addresses ---------------- */

export function fetchAddresses(): Promise<Address[]> {
  return http.get<Address[]>('/addresses');
}

export function createAddress(payload: AddressPayload): Promise<Address> {
  return http.post<Address>('/addresses', payload);
}

export function updateAddress(id: number, payload: Partial<AddressPayload>): Promise<Address> {
  return http.patch<Address>(`/addresses/${id}`, payload);
}

export function deleteAddress(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/addresses/${id}`);
}

/* ---------------- Checkout & orders ---------------- */

export function checkout(payload: CheckoutPayload): Promise<Order> {
  return http.post<Order>('/checkout', payload);
}

export function fetchMyOrders(): Promise<Order[]> {
  return http.get<Order[]>('/orders');
}

export function fetchMyOrder(id: number | string): Promise<Order> {
  return http.get<Order>(`/orders/${id}`);
}

export function fetchAdminOrders(): Promise<Paginated<Order>> {
  return http.get<Paginated<Order>>('/admin/orders');
}

export function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return http.patch<Order>(`/admin/orders/${id}/status`, { status });
}

/* ---------------- Printing requests ---------------- */

export function uploadLogo(file: File): Promise<{ logoUrl: string }> {
  const form = new FormData();
  form.append('logo', file);
  return http.upload<{ logoUrl: string }>('/printing-requests/upload-logo', form);
}

export function createPrintingRequest(payload: PrintingRequestPayload): Promise<PrintingRequest> {
  return http.post<PrintingRequest>('/printing-requests', payload);
}

export function fetchMyPrintingRequests(): Promise<PrintingRequest[]> {
  return http.get<PrintingRequest[]>('/printing-requests');
}

export function fetchAdminPrintingRequests(): Promise<PrintingRequest[]> {
  return http.get<PrintingRequest[]>('/admin/printing-requests');
}

export function updatePrintingRequest(id: number, payload: Record<string, unknown>): Promise<PrintingRequest> {
  return http.patch<PrintingRequest>(`/admin/printing-requests/${id}`, payload);
}

export function deletePrintingRequest(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/admin/printing-requests/${id}`);
}

/* ---------------- Water subscriptions ---------------- */

export function createWaterSubscription(payload: WaterSubscriptionPayload): Promise<WaterSubscription> {
  return http.post<WaterSubscription>('/water-subscriptions', payload);
}

export function fetchMySubscriptions(): Promise<WaterSubscription[]> {
  return http.get<WaterSubscription[]>('/water-subscriptions');
}

/* ---------------- Support tickets ---------------- */

export function createSupportTicket(payload: { subject: string; message: string }): Promise<SupportTicket> {
  return http.post<SupportTicket>('/support-tickets', payload);
}

export function fetchMyTickets(): Promise<SupportTicket[]> {
  return http.get<SupportTicket[]>('/support-tickets');
}

export interface TicketMessage {
  id: number;
  content: string;
  senderType: string;
  createdAt: string;
}

export function fetchTicketMessages(ticketId: number): Promise<TicketMessage[]> {
  return http.get<TicketMessage[]>(`/support-tickets/${ticketId}/messages`);
}

export function sendTicketMessage(ticketId: number, content: string): Promise<TicketMessage> {
  return http.post<TicketMessage>(`/support-tickets/${ticketId}/messages`, { content });
}

/* ---------------- Contact ---------------- */

export function sendContactMessage(payload: ContactPayload): Promise<{ success: boolean }> {
  return http.post<{ success: boolean }>('/contact', payload, { anonymous: true });
}

/* ---------------- Invoices (admin) ---------------- */

export function fetchAdminInvoices(): Promise<Paginated<Invoice>> {
  return http.get<Paginated<Invoice>>('/admin/invoices');
}

export function fetchInvoiceDetail(id: number | string): Promise<Invoice> {
  return http.get<Invoice>(`/admin/invoices/${id}`);
}

export function generateInvoice(orderId: number): Promise<Invoice> {
  return http.post<Invoice>(`/admin/invoices/generate/${orderId}`);
}

export function invoicePdfUrl(id: number | string): string {
  return `/admin/invoices/${id}/download-pdf`;
}

/* ---------------- Shipping (admin) ---------------- */

export function fetchShippingZones(): Promise<ShippingZone[]> {
  return http.get<ShippingZone[]>('/admin/shipping-zones');
}

export function createShippingZone(payload: Record<string, unknown>): Promise<ShippingZone> {
  return http.post<ShippingZone>('/admin/shipping-zones', payload);
}

export function updateShippingZone(id: number, payload: Record<string, unknown>): Promise<ShippingZone> {
  return http.patch<ShippingZone>(`/admin/shipping-zones/${id}`, payload);
}

export function deleteShippingZone(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/admin/shipping-zones/${id}`);
}
