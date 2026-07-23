import { test, expect } from '@fixtures/pageFixtures';
import { makeUser, makeProduct, COUPONS } from '@data/testData';

/**
 * Regression suite -- validation, filtering, sorting and admin CRUD.
 */
test.describe('@regression Nova Store', () => {
  test('REG-01 login fails with invalid credentials', async ({ auth }) => {
    await auth.goto();
    await auth.login('nobody@example.com', 'wrongpassword');

    // The API error surfaces under the password field.
    await expect(auth.passwordError).toBeVisible();
    expect(await auth.isLoggedOut()).toBe(true);
  });

  test('REG-02 duplicate-email registration is rejected', async ({ auth }) => {
    const user = makeUser();

    // First registration succeeds.
    await auth.goto();
    await auth.register(user.name, user.email, user.password);
    expect(await auth.isLoggedIn()).toBe(true);

    // Same address a second time must be refused. The app surfaces API
    // errors under the password field regardless of which field caused them.
    await auth.logoutButton.click();
    await auth.signInButton.click();
    await auth.register(user.name, user.email, user.password);

    await expect(auth.passwordError).toContainText(/already exists/i);
    expect(await auth.isLoggedOut()).toBe(true);
  });

  test('REG-03 product search filters the grid', async ({ shop }) => {
    await shop.goto();
    const before = await shop.count();

    // Search for a term taken from a product that is actually present,
    // so the test does not depend on any particular catalogue.
    const names = await shop.names();
    const term = names[0].split(' ')[0];

    await shop.search(term);
    const after = await shop.count();

    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThanOrEqual(before);

    const filtered = await shop.names();
    for (const n of filtered) {
      expect(n.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  test('REG-04 sort by price low-to-high orders ascending', async ({
    shop,
  }) => {
    await shop.goto();
    await shop.sortBy('low');

    const prices = await shop.prices();
    expect(prices.length).toBeGreaterThan(1);

    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('REG-05 admin creates a product and it appears in the store', async ({
    auth,
    admin,
    shop,
  }) => {
    const product = makeProduct();

    await auth.goto();
    await auth.loginAsAdmin();
    await admin.waitForPanel();

    await admin.openTab('catalog');
    await admin.createProduct(product);

    // Present in the admin catalogue ...
    await expect(admin.catalogRowByName(product.name)).toBeVisible();

    // ... and on the storefront.
    await shop.logo.click();
    await shop.waitForProducts();
    await shop.search(product.name);
    await expect(shop.cardByName(product.name)).toBeVisible();
  });

  test('@regression coupon SAVE10 reduces the total', async ({
    shop,
    cart,
  }) => {
    await shop.goto();
    await shop.addFirstToCart();
    await cart.goto();

    const before = await cart.totalValue();
    await cart.applyCoupon(COUPONS.percent10);

    await expect(cart.discount).toBeVisible();
    expect(await cart.totalValue()).toBeLessThan(before);
  });
});
