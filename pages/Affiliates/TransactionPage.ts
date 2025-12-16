import { Page, Locator, expect } from '@playwright/test';

export class TransactionsPage {
  readonly page: Page;

  readonly tableRows: Locator;
  readonly pendingAmountText: Locator;
  readonly totalCommissionText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.tableRows = page.locator('tbody > tr');
    this.pendingAmountText = page.locator('div.text-2xl.font-bold.text-amber-600.dark\\:text-amber-400')
    this.totalCommissionText = page.locator('div.text-2xl.font-bold.text-emerald-600.dark\\:text-emerald-400')
  }

  async goto() {
    await this.page.goto('http://13.52.122.247/portal/affiliate/transactions');
  }

  private parseCurrency(text: string | null): number {
    if (!text) return 0;
    return Number(text.replace(/[^\d.]/g, ''));
  }

  async validatePendingAndTotalCommission() {
    let calculatedPending = 0;
    let calculatedTotal = 0;

    const rowCount = await this.tableRows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = this.tableRows.nth(i);

      const commissionText = await row.locator('td').nth(2).textContent();
      const commission = this.parseCurrency(commissionText);
      calculatedTotal += commission;

      const statusText = await row.locator('td').nth(3).textContent();

      if (statusText?.includes('Pending')) {
        calculatedPending += commission;
      }
    }

    const uiPendingText = await this.pendingAmountText.textContent();
    const uiTotalText = await this.totalCommissionText.textContent();

    if(uiPendingText) await expect(this.page.getByText(uiPendingText, {exact:true})).toBeVisible()
    if(uiTotalText) await expect(this.page.getByText(uiTotalText, {exact:true})).toBeVisible()

  }
}
