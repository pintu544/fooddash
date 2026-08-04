import { test, expect } from '@playwright/test';

test.describe('Food Delivery App - Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => localStorage.clear());
  });

  test('TC1: Happy path — browse menu, add items, checkout, see tracking page', async ({
    page,
  }) => {
    // 1. Visit menu page
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /our menu/i }),
    ).toBeVisible();

    // 2. Add first available item to cart
    const addButtons = page.getByRole('button', { name: /add .+ to cart/i });
    await addButtons.first().waitFor({ state: 'visible' });
    await addButtons.first().click();

    // 3. Cart count badge should show 1
    await expect(
      page.getByRole('button', { name: /open cart/i }),
    ).toContainText('1');

    // 4. Add a second item
    const allAddButtons = page.getByRole('button', {
      name: /add .+ to cart/i,
    });
    await allAddButtons.nth(1).click();

    // 5. Open cart drawer
    await page.getByRole('button', { name: /open cart/i }).click();

    // 6. Cart drawer should be visible with 2 items
    await expect(page.getByRole('dialog', { name: /shopping cart/i })).toBeVisible();
    await expect(page.getByTestId('cart-item')).toHaveCount(2);

    // 7. Go to checkout
    await page.getByRole('link', { name: /checkout/i }).click();
    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();

    // 8. Fill in delivery details
    await page.getByLabel(/full name/i).fill('Jane Doe');
    await page
      .getByLabel(/delivery address/i)
      .fill('123 Main Street, Springfield');
    await page.getByLabel(/phone/i).fill('+1 555-0100');

    // 9. Submit order
    await page.getByRole('button', { name: /place order/i }).click();

    // 10. Should redirect to order tracking page
    await expect(page).toHaveURL(/\/orders\/.+/);
    await expect(
      page.getByRole('heading', { name: /order tracking/i }),
    ).toBeVisible();

    // 11. Initial status should be "Order Received"
    await expect(page.getByText('Order Received')).toBeVisible();
    await expect(page.getByText('Current')).toBeVisible();
  });

  test('TC2: Checkout validation — empty form shows all required errors', async ({
    page,
  }) => {
    // Manually add an item to cart via localStorage so checkout page is accessible
    await page.goto('/');
    const addButtons = page.getByRole('button', { name: /add .+ to cart/i });
    await addButtons.first().waitFor({ state: 'visible' });
    await addButtons.first().click();

    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();

    // Submit empty form
    await page.getByRole('button', { name: /place order/i }).click();

    // All validation errors should appear
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(
      page.getByText(/address must be at least/i),
    ).toBeVisible();
    await expect(page.getByText(/valid phone number/i)).toBeVisible();
  });

  test('TC3: Real-time update — status stepper advances after order placement', async ({
    page,
  }) => {
    // Add item and place order
    await page.goto('/');
    const addButton = page
      .getByRole('button', { name: /add .+ to cart/i })
      .first();
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();

    await page.goto('/checkout');
    await page.getByLabel(/full name/i).fill('Real Time User');
    await page.getByLabel(/delivery address/i).fill('456 Socket Street');
    await page.getByLabel(/phone/i).fill('+1 555-9999');
    await page.getByRole('button', { name: /place order/i }).click();

    // Wait for order tracking page
    await expect(page).toHaveURL(/\/orders\/.+/);

    // Wait for status to advance to "Preparing" (auto-advance fires after 10s)
    await expect(page.getByText('Preparing')).toBeVisible({ timeout: 20_000 });
    // The "Current" badge should now be on "Preparing"
    const preparingSection = page.locator('li', { hasText: 'Preparing' });
    await expect(preparingSection.getByText('Current')).toBeVisible();
  });
});
