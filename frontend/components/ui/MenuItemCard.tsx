'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();

  return (
    <article className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full h-48">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-900 leading-tight">
            {item.name}
          </h2>
          <span className="shrink-0 text-base font-bold text-orange-500">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 flex-1 leading-relaxed">
          {item.description}
        </p>
        <button
          type="button"
          onClick={() => addItem(item)}
          className="mt-2 w-full rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          aria-label={`Add ${item.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
