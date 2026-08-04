import { render, screen } from '@testing-library/react';
import { OrderStatusTracker } from '@/components/ui/OrderStatusTracker';

// Mock the useOrderStatus hook so we control status in tests
jest.mock('@/hooks/useOrderStatus', () => ({
  useOrderStatus: jest.fn(),
}));

import { useOrderStatus } from '@/hooks/useOrderStatus';

const mockUseOrderStatus = useOrderStatus as jest.MockedFunction<
  typeof useOrderStatus
>;

describe('OrderStatusTracker', () => {
  it('shows "Order Received" as active for RECEIVED status', () => {
    mockUseOrderStatus.mockReturnValue({ status: 'RECEIVED', connected: true });
    render(
      <OrderStatusTracker orderId="order-1" initialStatus="RECEIVED" />,
    );
    expect(screen.getByText('Order Received')).toBeInTheDocument();
    // "Current" badge should appear next to the active step
    const badges = screen.getAllByText('Current');
    expect(badges.length).toBe(1);
  });

  it('shows "Preparing" as active for PREPARING status', () => {
    mockUseOrderStatus.mockReturnValue({ status: 'PREPARING', connected: true });
    render(
      <OrderStatusTracker orderId="order-1" initialStatus="PREPARING" />,
    );
    expect(screen.getByText('Preparing')).toBeInTheDocument();
  });

  it('shows "Out for Delivery" as active for OUT_FOR_DELIVERY', () => {
    mockUseOrderStatus.mockReturnValue({
      status: 'OUT_FOR_DELIVERY',
      connected: true,
    });
    render(
      <OrderStatusTracker
        orderId="order-1"
        initialStatus="OUT_FOR_DELIVERY"
      />,
    );
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
  });

  it('shows "Delivered" as active for DELIVERED status', () => {
    mockUseOrderStatus.mockReturnValue({ status: 'DELIVERED', connected: true });
    render(
      <OrderStatusTracker orderId="order-1" initialStatus="DELIVERED" />,
    );
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('shows reconnecting indicator when disconnected', () => {
    mockUseOrderStatus.mockReturnValue({
      status: 'RECEIVED',
      connected: false,
    });
    render(
      <OrderStatusTracker orderId="order-1" initialStatus="RECEIVED" />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/reconnecting/i);
  });

  it('does not show reconnecting when connected', () => {
    mockUseOrderStatus.mockReturnValue({ status: 'RECEIVED', connected: true });
    render(
      <OrderStatusTracker orderId="order-1" initialStatus="RECEIVED" />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
