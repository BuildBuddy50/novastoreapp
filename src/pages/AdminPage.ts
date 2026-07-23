import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '@utils/env';
import type { NewProduct } from '@data/testData';

/** Admin console: dashboard, orders, catalog and customers. */
export class AdminPage extends BasePage {
  get panel(): Locator {
    return this.page.getByTestId('page-admin');
  }

  get accessDenied(): Locator {
    return this.page.getByTestId('admin-denied');
  }

  // ------------------------------------------------------------- dashboard

  get statRevenue(): Locator {
    return this.page.getByTestId('stat-revenue');
  }

  get statOrders(): Locator {
    return this.page.getByTestId('stat-orders');
  }

  get statCustomers(): Locator {
    return this.page.getByTestId('stat-customers');
  }

  get statProducts(): Locator {
    return this.page.getByTestId('stat-products');
  }

  // ------------------------------------------------------------------ tabs

  async openTab(
    tab: 'dashboard' | 'orders' | 'catalog' | 'customers',
  ): Promise<void> {
    await this.page.getByTestId(`admin-tab-${tab}`).click();
  }

  /** Wait for the panel after logging in as an administrator. */
  async waitForPanel(): Promise<void> {
    await expect(this.panel).toBeVisible({ timeout: TIMEOUTS.pageLoad });
  }

  // ---------------------------------------------------------------- orders

  get orderRows(): Locator {
    return this.page.getByTestId('order-row');
  }

  orderById(id: string | number): Locator {
    return this.page.locator(
      `[data-testid="order-row"][data-order-id="${id}"]`,
    );
  }

  async setOrderStatus(id: string | number, status: string): Promise<void> {
    await this.orderById(id)
      .getByTestId('order-row-status-select')
      .selectOption(status);
  }

  // --------------------------------------------------------------- catalog

  get catalogRows(): Locator {
    return this.page.getByTestId('catalog-row');
  }

  catalogRowByName(name: string): Locator {
    return this.page.locator(
      `[data-testid="catalog-row"][data-product-name="${name}"]`,
    );
  }

  /** Create a product from the catalog form. */
  async createProduct(p: NewProduct): Promise<void> {
    await this.page.getByTestId('catalog-name').fill(p.name);
    await this.page.getByTestId('catalog-price').fill(String(p.price));
    await this.page.getByTestId('catalog-stock').fill(String(p.stock));
    if (p.category) {
      await this.page.getByTestId('catalog-category').fill(p.category);
    }
    if (p.description) {
      await this.page.getByTestId('catalog-description').fill(p.description);
    }
    await this.page.getByTestId('catalog-submit').click();
  }

  async deleteProduct(name: string): Promise<void> {
    // The app confirms destructive actions with window.confirm.
    this.page.once('dialog', (d) => d.accept());
    await this.catalogRowByName(name).getByTestId('catalog-row-delete').click();
  }

  async searchCatalog(term: string): Promise<void> {
    await this.page.getByTestId('catalog-search').fill(term);
    await this.page.waitForTimeout(300);
  }

  // ------------------------------------------------------------- customers

  get customerRows(): Locator {
    return this.page.getByTestId('customer-row');
  }

  async openAddCustomer(): Promise<void> {
    await this.page.getByTestId('customers-tab-add').click();
  }
}
