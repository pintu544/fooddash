import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchOrder } from '@/lib/api';
import { OrderStatusTracker } from '@/components/ui/OrderStatusTracker';
import { OrderItem } from '@/types';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  let order;
  try {
    order = await fetchOrder(id);
  } catch {
    notFound();
  }

  const items = order.items as OrderItem[];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="text-sm text-orange-500 font-medium hover:underline"
        >
          ← Back to menu
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Order Tracking
        </h1>
        <p className="text-sm text-gray-500 font-mono mt-1">#{order.id}</p>
      </div>

      {/* Live status tracker */}
      <section
        aria-labelledby="status-heading"
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <h2
          id="status-heading"
          className="text-base font-semibold text-gray-900 mb-6"
        >
          Order Status
        </h2>
        <OrderStatusTracker
          orderId={order.id}
          initialStatus={order.status}
        />
      </section>

      {/* Delivery details */}
      <section
        aria-labelledby="details-heading"
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3"
      >
        <h2
          id="details-heading"
          className="text-base font-semibold text-gray-900"
        >
          Delivery Details
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-500">Name</dt>
            <dd className="text-gray-900 font-medium">
              {order.customerName}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-500">Address</dt>
            <dd className="text-gray-900">{order.address}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-500">Phone</dt>
            <dd className="text-gray-900">{order.phone}</dd>
          </div>
        </dl>
      </section>

      {/* Order items */}
      <section
        aria-labelledby="items-heading"
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
      >
        <h2
          id="items-heading"
          className="text-base font-semibold text-gray-900 mb-3"
        >
          Items Ordered
        </h2>
        <ul className="divide-y divide-gray-50">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between py-2.5 text-sm"
            >
              <span className="text-gray-700">
                {item.name}{' '}
                <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-3 border-t border-gray-100 font-semibold text-sm text-gray-900">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </section>
    </div>
  );
}
