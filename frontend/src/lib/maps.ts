import {
  Box,
  Coffee,
  Droplets,
  LayoutGrid,
  Package,
  ShoppingBag,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

/* ---------------- Category icons (backend sends the `icon` key) ---------------- */

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Trash2,
  ShoppingBag,
  Droplets,
  Box,
  Coffee,
  LayoutGrid,
};

export function categoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (iconKey && CATEGORY_ICONS[iconKey]) return CATEGORY_ICONS[iconKey];
  return Package;
}

const CATEGORY_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  sky: 'bg-cyan-100 text-cyan-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
  primary: 'bg-primary/10 text-primary',
};

export function categoryColor(colorKey: string | null | undefined): string {
  if (colorKey && CATEGORY_COLORS[colorKey]) return CATEGORY_COLORS[colorKey];
  return 'bg-gray-100 text-gray-600';
}

const CATEGORY_TINTS: Record<string, string> = {
  blue: 'from-blue-500/15 to-blue-500/5',
  sky: 'from-cyan-500/15 to-cyan-500/5',
  amber: 'from-amber-500/15 to-amber-500/5',
  rose: 'from-rose-500/15 to-rose-500/5',
  emerald: 'from-emerald-500/15 to-emerald-500/5',
  indigo: 'from-indigo-500/15 to-indigo-500/5',
  orange: 'from-orange-500/15 to-orange-500/5',
  purple: 'from-purple-500/15 to-purple-500/5',
  primary: 'from-secondary/20 to-secondary/5',
};

/** Soft gradient wash for category card visuals. */
export function categoryTint(colorKey: string | null | undefined): string {
  if (colorKey && CATEGORY_TINTS[colorKey]) return CATEGORY_TINTS[colorKey];
  return 'from-primary/10 to-transparent';
}

/* ---------------- Status / payment labels ---------------- */

export interface StatusMeta {
  label: string;
  style: string;
}

const FALLBACK_STATUS: StatusMeta = { label: 'غير معروف', style: 'bg-gray-100 text-gray-600' };

export const ORDER_STATUS_MAP: Record<string, StatusMeta> = {
  new_order: { label: 'جديد', style: 'bg-blue-100 text-blue-600' },
  processing: { label: 'قيد التجهيز', style: 'bg-orange-100 text-orange-600' },
  packed: { label: 'تم التغليف', style: 'bg-teal-100 text-teal-600' },
  shipped: { label: 'تم الشحن', style: 'bg-purple-100 text-purple-600' },
  delivered: { label: 'مكتمل', style: 'bg-green-100 text-green-600' },
  cancelled: { label: 'ملغي', style: 'bg-red-100 text-red-600' },
};

export const PRINTING_STATUS_MAP: Record<string, StatusMeta> = {
  new_request: { label: 'جديد', style: 'bg-blue-100 text-blue-600' },
  under_review: { label: 'تحت المراجعة', style: 'bg-orange-100 text-orange-600' },
  quoted: { label: 'تم إرسال عرض سعر', style: 'bg-purple-100 text-purple-600' },
  approved: { label: 'تمت الموافقة', style: 'bg-green-100 text-green-600' },
  rejected: { label: 'مرفوض', style: 'bg-red-100 text-red-600' },
  completed: { label: 'مكتمل', style: 'bg-gray-100 text-gray-600' },
};

export const SHIPMENT_STATUS_MAP: Record<string, StatusMeta> = {
  pending: { label: 'قيد الانتظار', style: 'bg-gray-100 text-gray-500' },
  label_created: { label: 'تم إنشاء البوليصة', style: 'bg-blue-50 text-blue-500' },
  shipped: { label: 'تم الشحن', style: 'bg-purple-50 text-purple-500' },
  delivered: { label: 'تم التوصيل', style: 'bg-green-50 text-green-500' },
};

export function statusMeta(map: Record<string, StatusMeta>, status: string | null | undefined): StatusMeta {
  if (status && map[status]) return map[status];
  return FALLBACK_STATUS;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mada: 'مدى',
  visa: 'فيزا / ماستركارد',
  apple_pay: 'Apple Pay',
  tamara: 'تمارا',
  cod: 'دفع عند الاستلام',
};

export function paymentMethodLabel(method: string | null | undefined): string {
  if (method && PAYMENT_METHOD_LABELS[method]) return PAYMENT_METHOD_LABELS[method];
  return method ?? '—';
}

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: 'مطعم',
  cafe: 'مقهى',
  hotel: 'فندق / ضيافة',
  office: 'شركة / مكتب',
  other: 'نشاط تجاري آخر',
};

export function businessTypeLabel(type: string | null | undefined): string {
  if (type && BUSINESS_TYPE_LABELS[type]) return BUSINESS_TYPE_LABELS[type];
  return type ?? '—';
}
