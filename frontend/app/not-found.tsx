import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <p className="text-6xl mb-4" aria-hidden="true">
        🍽️
      </p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Page Not Found
      </h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        We couldn't find that page. The order may not exist, or the link
        may be incorrect.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        Back to Menu
      </Link>
    </div>
  );
}
