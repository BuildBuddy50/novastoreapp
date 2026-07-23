import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '@utils/env';
import type { CheckoutDetails } from '@data/testData';

/** Cart, checkout form and order confirmation. */
export class CartPage extends BasePage {
  // ------------------------------------------------------------------ cart

  get page_(): Locator {
    return this.page.getByTestId('page-cart');
  }

  get items(): Locator {
    return this.page.getByTestId('cart-item');
  }

  get emptyState(): Locator {
    return this.page.getByTestId('cart-empty');
  }

  get couponInput(): Locator {
    return this.page.getByTestId('coupon-input');
  }

  get couponApply(): Locator {
    return this.page.getByTestId('coupon-apply');
  }

  get subtotal(): Locator {
    return this.page.getByTestId('summary-subtotal');
  }

  get discount(): Locator {
    return this.page.getByTestId('summary-discount');
  }

  get total(): Locator {
    return this.page.getByTestId('summary-total');
  }

  get checkoutButton(): Locator {
    return this.page.getByTestId('proceed-to-checkout');
  }

  // -------------------------------------------------------------- checkout

  get checkoutPage(): Locator {
    return this.page.getByTestId('page-checkout');
  }

  get placeOrderButton(): Locator {
    return this.page.getByTestId('place-order');
  }

  // ---------------------------------------------------------- confirmation

  get confirmation(): Locator {
    return this.page.getByTestId('order-confirmation');
  }

  get confirmationOrderId(): Locator {
    return this.page.getByTestId('confirmation-order-id');
  }

  get confirmationTotal(): Locator {
    return this.page.getByTestId('confirmation-total');
  }

  // --------------------------------------------------------------- actions

  /** Open the cart from the header. */
  async goto(): Promise<void> {
    await this.cartButton.click();
  }

  async itemCount(): Promise<number> {
    return this.items.count();
  }

  itemByName(name: string): Locator {
    return this.page.locator(
      `[data-testid="cart-item"][data-product-name="${name}"]`,
    );
  }

  async increaseQty(name: string): Promise<void> {
    await this.itemByName(name).getByTestId('cart-item-increase').click();
  }

  async removeItem(name: string): Promise<void> {
    await this.itemByName(name).getByTestId('cart-item-remove').click();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.couponApply.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.checkoutPage).toBeVisible({
      timeout: TIMEOUTS.assertion,
    });
  }

  /** Fill shipping details. Card fields come from the test-card shortcut. */
  async fillShipping(d: CheckoutDetails): Promise<void> {
    await this.page.getByTestId('checkout-name').fill(d.name);
    await this.page.getByTestId('checkout-email').fill(d.email);
    await this.page.getByTestId('checkout-phone').fill(d.phone);
    await this.page.getByTestId('checkout-address').fill(d.address);
    await this.page.getByTestId('checkout-city').fill(d.city);
    await this.page.getByTestId('checkout-zip').fill(d.zip);
  }

  /** The app ships clearly-labelled test cards; clicking one autofills. */
  async useTestCard(brand: 'visa' | 'mastercard' | 'amex' = 'visa'): Promise<void> {
    await this.page.getByTestId(`test-card-${brand}`).click();
  }

  async selectPayment(method: 'card' | 'paypal' | 'cod'): Promise<void> {
    await this.page.getByTestId(`payment-option-${method}`).click();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await expect(this.confirmation).toBeVisible({
      timeout: TIMEOUTS.pageLoad,
    });
  }

  /** Full happy path from a populated cart to a confirmed order. */
  async completeCheckout(d: CheckoutDetails): Promise<string> {
    await this.proceedToCheckout();
    await this.fillShipping(d);
    await this.useTestCard('visa');
    await this.placeOrder();
    return (await this.confirmationOrderId.innerText()).trim();
  }

  /** Numeric value of a summary row, e.g. total() -> 218.67 */
  async totalValue(): Promise<number> {
    const t = await this.total.innerText();
    return parseFloat(t.replace(/[^0-9.]/g, ''));
  }
}
