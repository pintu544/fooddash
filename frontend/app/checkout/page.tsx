'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';

// ─── Validation schema ────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters'),
  phone: z
    .string()
    .regex(
      /^\+?[\d\s\-().]{7,20}$/,
      'Please enter a valid phone number',
    ),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    setApiError(null);

    try {
      const order = await createOrder({
        customerName: data.customerName,
        address: data.address,
        phone: data.phone,
        items: items.map(({ menuItemId, name, price, quantity }) => ({
          menuItemId,
          name,
          price,
          quantity,
        })),
      });
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to place order. Please try again.',
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-orange-500 font-semibold hover:underline"
        >
          ← Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-orange-500 font-medium hover:underline"
        >
          ← Back to menu
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Order summary */}
      <section aria-labelledby="order-summary-heading">
        <h2
          id="order-summary-heading"
          className="text-base font-semibold text-gray-900 mb-3"
        >
          Order Summary
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex justify-between px-4 py-3 text-sm"
            >
              <span className="text-gray-700">
                {item.name}{' '}
                <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 font-semibold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Delivery form */}
      <section aria-labelledby="delivery-heading">
        <h2
          id="delivery-heading"
          className="text-base font-semibold text-gray-900 mb-3"
        >
          Delivery Details
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="customerName"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                errors.customerName
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
              aria-describedby={
                errors.customerName ? 'customerName-error' : undefined
              }
              aria-invalid={!!errors.customerName}
              {...register('customerName')}
            />
            {errors.customerName && (
              <p
                id="customerName-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.customerName.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Delivery Address
            </label>
            <textarea
              id="address"
              rows={3}
              autoComplete="street-address"
              placeholder="123 Main St, Springfield"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none ${
                errors.address
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
              aria-describedby={
                errors.address ? 'address-error' : undefined
              }
              aria-invalid={!!errors.address}
              {...register('address')}
            />
            {errors.address && (
              <p
                id="address-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555-0100"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${
                errors.phone
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p
                id="phone-error"
                role="alert"
                className="mt-1 text-xs text-red-600"
              >
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            {isSubmitting ? 'Placing order…' : 'Place Order →'}
          </button>
        </form>
      </section>
    </div>
  );
}
