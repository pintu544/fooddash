import { render, screen, fireEvent, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { MenuItem } from '@/types';

const mockItem: MenuItem = {
  id: 'item-1',
  name: 'Test Pizza',
  description: 'A test pizza',
  price: 9.99,
  imageUrl: 'https://example.com/pizza.jpg',
  category: 'pizza',
  available: true,
};

const mockItem2: MenuItem = {
  id: 'item-2',
  name: 'Test Burger',
  description: 'A test burger',
  price: 7.99,
  imageUrl: 'https://example.com/burger.jpg',
  category: 'burger',
  available: true,
};

// Test component that exposes cart state
function CartTestConsumer() {
  const { items, itemCount, total, addItem, updateQuantity, removeItem } =
    useCart();

  return (
    <div>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="total">{total.toFixed(2)}</span>
      <button onClick={() => addItem(mockItem)}>Add Pizza</button>
      <button onClick={() => addItem(mockItem2)}>Add Burger</button>
      <button onClick={() => updateQuantity('item-1', 3)}>Set Pizza Qty 3</button>
      <button onClick={() => updateQuantity('item-1', 0)}>Remove Pizza</button>
      <button onClick={() => removeItem('item-1')}>Delete Pizza</button>
      {items.map((i) => (
        <div key={i.menuItemId} data-testid={`item-${i.menuItemId}`}>
          {i.name}: {i.quantity}
        </div>
      ))}
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage between tests to prevent state bleed
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0.00');
  });

  it('adds an item and updates count and total', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText('Add Pizza'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('9.99');
  });

  it('increments quantity when same item added twice', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText('Add Pizza'));
    fireEvent.click(screen.getByText('Add Pizza'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('19.98');
  });

  it('updates quantity to 3 and recalculates total', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText('Add Pizza'));
    fireEvent.click(screen.getByText('Set Pizza Qty 3'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('3');
    expect(screen.getByTestId('total')).toHaveTextContent('29.97');
  });

  it('removes item when quantity set to 0', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText('Add Pizza'));
    fireEvent.click(screen.getByText('Remove Pizza'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('handles multiple different items', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );
    fireEvent.click(screen.getByText('Add Pizza'));
    fireEvent.click(screen.getByText('Add Burger'));
    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    // 9.99 + 7.99 = 17.98
    expect(screen.getByTestId('total')).toHaveTextContent('17.98');
  });
});
