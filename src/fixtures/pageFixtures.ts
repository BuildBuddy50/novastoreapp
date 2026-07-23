import { test as base, expect } from '@playwright/test';
import { ShopPage } from '@pages/ShopPage';
import { AuthPage } from '@pages/AuthPage';
import { CartPage } from '@pages/CartPage';
import { AdminPage } from '@pages/AdminPage';

/**
 * Page objects are injected into every test, so specs never construct them
 * by hand and never touch `page` directly for navigation.
 */
type Pages = {
  shop: ShopPage;
  auth: AuthPage;
  cart: CartPage;
  admin: AdminPage;
};

export const test = base.extend<Pages>({
  shop: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  auth: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  admin: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
});

export { expect };
