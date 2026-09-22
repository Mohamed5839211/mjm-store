import { redirect } from 'next/navigation';

/** Legacy route: /categories forwards to the shop (search preserved). */
export default function CategoriesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  redirect(searchParams.search ? `/shop?search=${encodeURIComponent(searchParams.search)}` : '/shop');
}
