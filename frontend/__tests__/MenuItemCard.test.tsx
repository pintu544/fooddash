import { render, screen, fireEvent } from '@testing-library/react';
import { MenuItemCard } from '@/components/ui/MenuItemCard';
import { CartProvider } from '@/context/CartContext';
import { MenuItem } from '@/types';

const mockItem: MenuItem = {
  id: 'item-1',
  name: 'Test Pizza',
  description: 'A delicious test pizza',
  price: 9.99,
  imageUrl: 'https://images.unsplash.com/photo-test',
  category: 'pizza',
  available: true,
};

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('MenuItemCard', () => {
  it('renders item name', () => {
    renderWithCart(<MenuItemCard item={mockItem} />);
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
  });

  it('renders item price formatted', () => {
    renderWithCart(<MenuItemCard item={mockItem} />);
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('renders item description', () => {
    renderWithCart(<MenuItemCard item={mockItem} />);
    expect(screen.getByText('A delicious test pizza')).toBeInTheDocument();
  });

  it('has an accessible Add to Cart button', () => {
    renderWithCart(<MenuItemCard item={mockItem} />);
    expect(
      screen.getByRole('button', { name: /add test pizza to cart/i }),
    ).toBeInTheDocument();
  });

  it('clicking Add to Cart does not throw', () => {
    renderWithCart(<MenuItemCard item={mockItem} />);
    const button = screen.getByRole('button', { name: /add test pizza to cart/i });
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});
