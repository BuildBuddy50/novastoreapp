import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '@utils/env';

/** Storefront: product grid, filters, search, sort, add-to-cart. */
export class ShopPage extends BasePage {
  get grid(): Locator {
    return this.page.getByTestId('product-grid');
  }

  get cards(): Locator {
    return this.page.getByTestId('product-card');
  }

  get productCount(): Locator {
    return this.page.getByTestId('product-count');
  }

  get sortSelect(): Locator {
    return this.page.getByTestId('sort-select');
  }

  get emptyMessage(): Locator {
    return this.page.getByTestId('no-products');
  }

  /** Load the storefront and wait for products to render. */
  async goto(): Promise<void> {
    await this.open();
    await this.waitForProducts();
  }

  /**
   * Wait for the grid. Uses the long timeout because a cold backend can
   * take ~30s to return the first payload.
   */
  async waitForProducts(): Promise<void> {
    await expect(this.grid).toBeVisible({ timeout: TIMEOUTS.pageLoad });
    await expect(this.cards.first()).toBeVisible({ timeout: TIMEOUTS.pageLoad });
  }

  async count(): Promise<number> {
    return this.cards.count();
  }

  /** Search from the header. The grid filters as you type. */
  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    // Let React re-render the filtered list.
    await this.page.waitForTimeout(400);
  }

  async filterByCategory(category: string): Promise<void> {
    await this.page.getByTestId(`filter-category-${category}`).click();
    await this.page.waitForTimeout(300);
  }

  /** Options: featured | low | high | rating */
  async sortBy(value: 'featured' | 'low' | 'high' | 'rating'): Promise<void> {
    await this.sortSelect.selectOption(value);
    await this.page.waitForTimeout(300);
  }

  /** A single card, addressed by its product name rather than position. */
  cardByName(name: string): Locator {
    return this.page.locator(
      `[data-testid="product-card"][data-product-name="${name}"]`,
    );
  }

  async addFirstToCart(): Promise<string> {
    const first = this.cards.first();
    const name = (await first.getAttribute('data-product-name')) ?? '';
    await first.getByTestId('product-card-add').click();
    return name;
  }

  async addToCartByName(name: string): Promise<void> {
    await this.cardByName(name).getByTestId('product-card-add').click();
  }

  async openFirstProduct(): Promise<void> {
    await this.cards.first().getByTestId('product-card-name').click();
    await expect(this.page.getByTestId('page-product')).toBeVisible({
      timeout: TIMEOUTS.assertion,
    });
  }

  /** Visible prices, in grid order, as numbers. */
  async prices(): Promise<number[]> {
    const raw = await this.cards
      .locator('[data-testid="product-card-price"]')
      .allInnerTexts();
    return raw.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')));
  }

  async names(): Promise<string[]> {
    return this.cards
      .locator('[data-testid="product-card-name"]')
      .allInnerTexts();
  }
}
