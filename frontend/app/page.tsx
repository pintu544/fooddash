import { Suspense } from 'react';
import { fetchMenu } from '@/lib/api';
import { MenuItemCard } from '@/components/ui/MenuItemCard';
import { MenuSkeleton } from '@/components/ui/MenuSkeleton';

async function MenuGrid() {
  const items = await fetchMenu();

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 py-16">
        No menu items available right now. Check back soon!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
        <p className="mt-1 text-gray-500">
          Fresh ingredients, delivered fast. Pick your favourites.
        </p>
      </div>
      <Suspense fallback={<MenuSkeleton />}>
        <MenuGrid />
      </Suspense>
    </div>
  );
}
