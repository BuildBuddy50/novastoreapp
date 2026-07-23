import { test, expect } from '@fixtures/pageFixtures';
import { makeUser, makeCheckout } from '@data/testData';
import { env } from '@utils/env';

/**
 * Smoke suite -- the critical path. If any of these fail the deployment is
 * not usable, regardless of what the regression suite reports.
 */
test.describe('@smoke Nova Store critical path', () => {
  test('SMOKE-01 storefront loads with products', async ({ shop }) => {
    await shop.goto();

    // Confirm we landed inside the app, not on the hosting root.
    expect(shop.url()).toContain(new URL(env.baseURL).pathname);

    await shop.assertNoApiError();
    expect(await shop.count()).toBeGreaterThan(0);
    await expect(shop.productCount).toContainText('products');
  });

  test('SMOKE-02 new customer can register', async ({ auth }) => {
    const user = makeUser();

    await auth.goto();
    await auth.register(user.name, user.email, user.password);

    // Registration signs the user in and returns them to the storefront.
    expect(await auth.isLoggedIn()).toBe(true);
  });

  test('SMOKE-03 admin can log in and reach the dashboard', async ({
    auth,
    admin,
  }) => {
    await auth.goto();
    await auth.loginAsAdmin();

    await admin.waitForPanel();
    await expect(admin.statRevenue).toContainText('$');
    await expect(admin.statOrders).toBeVisible();
  });

  test('SMOKE-04 a product can be added to the cart', async ({ shop }) => {
    await shop.goto();
    await shop.addFirstToCart();

    await expect(shop.cartCount).toHaveText('1');
  });

  test('SMOKE-05 guest completes checkout end-to-end', async ({
    shop,
    cart,
  }) => {
    await shop.goto();
    const productName = await shop.addFirstToCart();

    await cart.goto();
    await expect(cart.itemByName(productName)).toBeVisible();

    const orderId = await cart.completeCheckout(makeCheckout());

    expect(orderId).toMatch(/#\d+/);
    await expect(cart.confirmationTotal).toContainText('$');
  });
});
