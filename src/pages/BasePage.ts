import { Page, Locator, expect } from '@playwright/test';
import { env, TIMEOUTS } from '@utils/env';

/**
 * Shared behaviour for every page object: navigation, header controls,
 * and toast handling.
 *
 * Locators use data-testid throughout. Those attributes exist purely for
 * automation, so restyling or rewording the UI does not break the suite.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  // ---------------------------------------------------------------- header

  get searchBox(): Locator {
    return this.page.getByTestId('nav-search');
  }

  get cartButton(): Locator {
    return this.page.getByTestId('nav-cart');
  }

  get cartCount(): Locator {
    return this.page.getByTestId('cart-count');
  }

  get signInButton(): Locator {
    return this.page.getByTestId('nav-signin');
  }

  get adminButton(): Locator {
    return this.page.getByTestId('nav-admin');
  }

  get logoutButton(): Locator {
    return this.page.getByTestId('nav-logout');
  }

  get logo(): Locator {
    return this.page.getByTestId('nav-logo');
  }

  // ------------------------------------------------------------ navigation

  /**
   * Navigate to a path within the app.
   *
   * The URL is joined explicitly rather than relying on Playwright's
   * baseURL resolution. That resolution treats a leading slash as "domain
   * root", which silently discards the sub-path when an app is hosted under
   * one (as GitHub Pages project sites are). Stripping the slash here makes
   * open('/shop'), open('shop') and open() all behave the same.
   */
  async open(path = ''): Promise<void> {
    const target = env.baseURL + path.replace(/^\/+/, '');
    await this.page.goto(target, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUTS.pageLoad,
    });
  }

  /** Current browser URL -- useful in assertions and debugging. */
  url(): string {
    return this.page.url();
  }

  title(): Promise<string> {
    return this.page.title();
  }

  // ---------------------------------------------------------------- toasts

  get toast(): Locator {
    return this.page.getByTestId('toast');
  }

  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.toast.filter({ hasText: text }).first()).toBeVisible({
      timeout: TIMEOUTS.assertion,
    });
  }

  // ----------------------------------------------------------------- state

  get spinner(): Locator {
    return this.page.getByTestId('loading-spinner');
  }

  get errorBox(): Locator {
    return this.page.getByTestId('error-box');
  }

  /**
   * Fail fast with a clear message when the app cannot reach its backend,
   * rather than letting a downstream locator time out with no explanation.
   */
  async assertNoApiError(): Promise<void> {
    if (await this.errorBox.isVisible().catch(() => false)) {
      const msg = await this.page.getByTestId('error-message').innerText();
      throw new Error(`App reported an API error: ${msg}`);
    }
  }
}
