export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

export type OrderStatus =
  | 'RECEIVED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends OrderItem {
  imageUrl: string;
}

export interface CreateOrderPayload {
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
}
