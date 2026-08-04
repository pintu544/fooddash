import { MenuItem, Order, CreateOrderPayload } from '@/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { error?: string }).error ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${API_URL}/api/menu`, {
    next: { revalidate: 60 }, // ISR — revalidate menu every 60 s
  });
  return handleResponse<MenuItem[]>(res);
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Order>(res);
}

export async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/api/orders/${id}`, {
    cache: 'no-store',
  });
  return handleResponse<Order>(res);
}
