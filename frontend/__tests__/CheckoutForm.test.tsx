import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from '@/app/checkout/page';
import { CartProvider } from '@/context/CartContext';
import * as api from '@/lib/api';
import React from 'react';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock the API
jest.mock('@/lib/api');

// Pre-seed cart in localStorage then render CheckoutPage
function renderCheckout() {
  localStorage.setItem(
    'food_delivery_cart',
    JSON.stringify([
      {
        menuItemId: 'item-1',
        name: 'Test Pizza',
        price: 9.99,
        imageUrl: 'https://example.com/img.jpg',
        quantity: 2,
      },
    ]),
  );
  return render(
    <CartProvider>
      <CheckoutPage />
    </CartProvider>,
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    (api.createOrder as jest.Mock).mockReset();
    localStorage.clear();
  });

  it('shows empty cart message when cart is empty', () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>,
    );
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    renderCheckout();
    await user.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid phone', async () => {
    const user = userEvent.setup();
    renderCheckout();
    await user.type(screen.getByLabelText(/full name/i), 'Jane');
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main St');
    await user.type(screen.getByLabelText(/phone/i), 'abc');
    await user.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
    });
  });

  it('calls createOrder with correct payload on valid submit', async () => {
    const user = userEvent.setup();
    (api.createOrder as jest.Mock).mockResolvedValue({ id: 'order-123' });

    renderCheckout();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main Street');
    await user.type(screen.getByLabelText(/phone/i), '+1 555-0100');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: 'Jane Doe',
          address: '123 Main Street',
          phone: '+1 555-0100',
        }),
      );
    });
  });

  it('redirects to order page on success', async () => {
    const user = userEvent.setup();
    (api.createOrder as jest.Mock).mockResolvedValue({ id: 'order-123' });

    renderCheckout();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main Street');
    await user.type(screen.getByLabelText(/phone/i), '+1 555-0100');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/orders/order-123');
    });
  });

  it('shows API error message on failure', async () => {
    const user = userEvent.setup();
    (api.createOrder as jest.Mock).mockRejectedValue(
      new Error('Service unavailable'),
    );

    renderCheckout();

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/delivery address/i), '123 Main Street');
    await user.type(screen.getByLabelText(/phone/i), '+1 555-0100');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
    });
  });
});
