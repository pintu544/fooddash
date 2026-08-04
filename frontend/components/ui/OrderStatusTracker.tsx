'use client';

import { OrderStatus } from '@/types';
import { useOrderStatus } from '@/hooks/useOrderStatus';

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'RECEIVED', label: 'Order Received', icon: '📋' },
  { status: 'PREPARING', label: 'Preparing', icon: '👨‍🍳' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
  { status: 'DELIVERED', label: 'Delivered', icon: '✅' },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  RECEIVED: 0,
  PREPARING: 1,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
};

interface OrderStatusTrackerProps {
  orderId: string;
  initialStatus: OrderStatus;
}

export function OrderStatusTracker({
  orderId,
  initialStatus,
}: OrderStatusTrackerProps) {
  const { status, connected } = useOrderStatus(orderId, initialStatus);
  const activeIndex = STATUS_INDEX[status];

  return (
    <div className="space-y-6">
      {/* Connection indicator */}
      {!connected && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2"
        >
          <span className="animate-pulse">⟳</span>
          Reconnecting to live updates…
        </div>
      )}

      {/* Stepper */}
      <ol
        aria-label="Order status"
        className="relative"
      >
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <li
              key={step.status}
              className={`relative flex items-start gap-4 pb-8 last:pb-0 ${
                index < STEPS.length - 1
                  ? 'before:absolute before:left-5 before:top-10 before:h-full before:w-0.5 before:content-[""]'
                  : ''
              } ${
                isCompleted
                  ? 'before:bg-orange-400'
                  : 'before:bg-gray-200'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Icon circle */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all ${
                  isCompleted
                    ? 'border-orange-400 bg-orange-400'
                    : isActive
                    ? 'border-orange-500 bg-orange-500 ring-4 ring-orange-100'
                    : 'border-gray-200 bg-white'
                }`}
                aria-hidden="true"
              >
                {step.icon}
              </div>

              {/* Label */}
              <div className="pt-1.5">
                <p
                  className={`text-sm font-semibold ${
                    isActive
                      ? 'text-orange-600'
                      : isCompleted
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      Current
                    </span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
