/** Commerce domain: cart (local), orders, addresses, checkout. */

export interface LocalCartItem {
  /** Stable client-side id (crypto.randomUUID). */
  id: string;
  productId?: number;
  bundleId?: number;
  name: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  image: string | null;
  category?: string;
}

export type AddToCartInput =
  | { kind: 'product'; productId: number; name: string; price: number; discountPrice?: number | null; image?: string | null; category?: string }
  | { kind: 'bundle'; bundleId: number; name: string; price: number; image?: string | null };

export interface Address {
  id: number;
  city: string;
  district: string;
  street: string;
  buildingNo: string;
  additionalInfo: string | null;
  isDefault: boolean;
}

export interface AddressPayload {
  city: string;
  district: string;
  street: string;
  buildingNo: string;
  additionalInfo?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'new_order'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'mada' | 'visa' | 'apple_pay' | 'tamara' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: number;
  productId: number | null;
  bundleId: number | null;
  quantity: number;
  unitPrice: number | string;
  finalPrice: number | string;
  product?: { id: number; name: string } | null;
  bundle?: { id: number; name: string } | null;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number | string;
  shippingFee: number | string;
  discountAmount: number | string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: OrderItem[];
  address?: Address | null;
  customer?: { name: string; phone?: string; email?: string } | null;
}

export interface CheckoutPayload {
  shippingAddressId: number;
  paymentMethod: PaymentMethod;
  /** Local cart snapshot — the server re-prices every line from the DB. */
  items?: Array<{ productId?: number; bundleId?: number; quantity: number }>;
}

export interface PrintingRequestPayload {
  businessName: string;
  businessType: string;
  contactPerson: string;
  phone: string;
  email: string;
  productType: string;
  expectedQuantity: number;
  notes?: string;
  logoUrl?: string | null;
}

export interface PrintingRequest extends PrintingRequestPayload {
  id: number;
  status: string;
  quotedPrice: number | string | null;
  internalNotes: string | null;
  createdAt: string;
}

export interface WaterSubscription {
  id: number;
  type: string;
  quantityPerOrder: number;
  frequency: string;
  status: string;
  nextDeliveryDate: string | null;
}

export interface WaterSubscriptionPayload {
  type: string;
  quantityPerOrder: number;
  frequency: string;
}

export interface SupportTicket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  totalAmount: number | string;
  vatAmount: number | string;
  status: string;
  createdAt: string;
  order?: (Order & { shippingFee: number | string }) | null;
}

export interface ShippingZone {
  id: number;
  name: string;
  cities: string[];
  baseRate: number | string;
  freeShippingThreshold: number | string | null;
  isActive: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}
