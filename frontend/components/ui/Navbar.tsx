'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const { itemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <nav
          className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="text-xl font-bold text-orange-500 tracking-tight"
          >
            🍕 FoodDash
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition-colors"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <span aria-hidden="true">🛒</span>
            Cart
            {itemCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </header>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
