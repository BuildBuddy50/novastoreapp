import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ADMIN, TIMEOUTS } from '@utils/env';

/** Sign-in and registration, for both customer and admin roles. */
export class AuthPage extends BasePage {
  get customerTab(): Locator {
    return this.page.getByTestId('auth-role-user');
  }

  get adminTab(): Locator {
    return this.page.getByTestId('auth-role-admin');
  }

  get nameInput(): Locator {
    return this.page.getByTestId('auth-name');
  }

  get emailInput(): Locator {
    return this.page.getByTestId('auth-email');
  }

  get passwordInput(): Locator {
    return this.page.getByTestId('auth-password');
  }

  get confirmInput(): Locator {
    return this.page.getByTestId('auth-confirm');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('auth-submit');
  }

  get toggleModeLink(): Locator {
    return this.page.getByTestId('auth-toggle-mode');
  }

  /** Errors render under their field, id + "-error". */
  get emailError(): Locator {
    return this.page.getByTestId('auth-email-error');
  }

  get passwordError(): Locator {
    return this.page.getByTestId('auth-password-error');
  }

  /** Open the storefront, then the auth screen via the header. */
  async goto(): Promise<void> {
    await this.open();
    await expect(this.signInButton).toBeVisible({ timeout: TIMEOUTS.pageLoad });
    await this.signInButton.click();
    await expect(this.emailInput).toBeVisible({ timeout: TIMEOUTS.assertion });
  }

  async switchToRegister(): Promise<void> {
    await this.toggleModeLink.click();
    await expect(this.nameInput).toBeVisible({ timeout: TIMEOUTS.assertion });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAsAdmin(): Promise<void> {
    await this.adminTab.click();
    await this.login(ADMIN.email, ADMIN.password);
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.switchToRegister();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * True once the header shows a logged-in state.
   *
   * Waits for the element rather than polling once: the header re-renders
   * only after the auth request resolves, so an immediate isVisible() check
   * would race the network and report false.
   */
  async isLoggedIn(timeout = TIMEOUTS.assertion): Promise<boolean> {
    try {
      await this.logoutButton.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /** Inverse check with a short timeout, for negative assertions. */
  async isLoggedOut(timeout = 5_000): Promise<boolean> {
    try {
      await this.signInButton.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}
