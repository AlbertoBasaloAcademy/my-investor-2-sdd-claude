import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object for the bookings section rendered at the SPA root.
 * Exposes intent-revealing locators and actions only; assertions live in the specs.
 */
export class BookingPage {
  readonly feature: Locator;
  readonly launchSelect: Locator;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly list: Locator;
  readonly items: Locator;
  readonly statuses: Locator;
  readonly cancelButtons: Locator;

  constructor(private readonly page: Page) {
    this.feature = page.getByTestId('bookings-feature');
    this.launchSelect = page.getByTestId('booking-launch-select');
    this.form = page.getByTestId('booking-form');
    this.nameInput = page.getByTestId('booking-name');
    this.emailInput = page.getByTestId('booking-email');
    this.phoneInput = page.getByTestId('booking-phone');
    this.submitButton = page.getByTestId('booking-submit');
    this.list = page.getByTestId('booking-list');
    this.items = page.getByTestId('booking-item');
    this.statuses = page.getByTestId('booking-status');
    this.cancelButtons = page.getByTestId('booking-cancel');
  }

  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    await this.page.goto('/', options);
  }

  async selectLaunch(launchId: string): Promise<void> {
    await this.launchSelect.selectOption(launchId);
  }

  async fillForm(name: string, email: string, phone: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  async cancelBooking(index: number): Promise<void> {
    await this.cancelButtons.nth(index).click();
  }

  getBookingItems(): Locator {
    return this.items;
  }

  getBookingStatus(index: number): Locator {
    return this.statuses.nth(index);
  }
}
