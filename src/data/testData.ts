/**
 * Data factories.
 *
 * This suite runs against a live, shared environment, so every generated
 * value carries a timestamp and a random suffix. Tests never collide with
 * each other or with data left behind by earlier runs, and no cleanup step
 * is required.
 */

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export interface NewProduct {
  name: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
}

export interface CheckoutDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

const stamp = (): string =>
  `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export const makeUser = (overrides: Partial<NewUser> = {}): NewUser => ({
  name: `Test User ${stamp()}`,
  email: `qa_${stamp()}@example.com`,
  password: 'Secret123!',
  ...overrides,
});

export const makeProduct = (
  overrides: Partial<NewProduct> = {},
): NewProduct => ({
  name: `QA Product ${stamp()}`,
  price: 49.99,
  stock: 25,
  category: 'Electronics',
  description: 'Created by the automated regression suite.',
  ...overrides,
});

export const makeCheckout = (
  overrides: Partial<CheckoutDetails> = {},
): CheckoutDetails => ({
  name: 'Priya Sharma',
  email: `buyer_${stamp()}@example.com`,
  phone: '9876543210',
  address: '12 MG Road',
  city: 'Hyderabad',
  zip: '500001',
  ...overrides,
});

/** Coupons the API recognises. */
export const COUPONS = {
  percent10: 'SAVE10',
  flat5: 'WELCOME5',
  invalid: 'NOTAREALCODE',
};
