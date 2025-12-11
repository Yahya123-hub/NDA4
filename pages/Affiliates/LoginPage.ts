import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly affiliatebtn1: Locator;
  readonly affiliatebtn2: Locator;
  readonly searchInput: Locator;
  readonly approvebtn : Locator;
  readonly commissiondropdown : Locator;
  readonly referraldropdown : Locator;
  readonly submitbtn : Locator;
  readonly asserter : Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Email")
    this.passwordInput = page.getByPlaceholder("Password")
    this.loginButton = page.getByRole('button', {name : '🔐 Sign In', exact:true})
    this.affiliatebtn1 = page.getByText('Affiliates', {exact:true}).first()
    this.affiliatebtn2 = page.locator('a[href="/portal/admin/affiliates/users"]')
    this.searchInput = page.locator('input[placeholder="Search..."]');
    this.approvebtn = page.locator('//button[@class="hover:text-primary"]')
    this.commissiondropdown = page.locator('input[id="commission_type"]')
    this.referraldropdown = page.locator('input[id="referral_link"]')
    this.submitbtn = page.getByText("Submit", {exact:true})
    this.asserter = page.getByText('Affiliate user approved successfully', {exact:true})
  }

  async goto() {
    await this.page.goto('http://13.52.122.247/auth/login'); 
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginSuccess() {
  await expect(this.page).toHaveURL(/.*portal.*/, { timeout: 30000 });
  //if this becomes flaky, use a dashboard ui element to assert
  }

  async approveaffiliate(email: string) {
    await this.affiliatebtn1.click()
    await expect(this.affiliatebtn2).toBeVisible()
    await this.affiliatebtn2.click()
    await this.searchInput.fill(email)
    const row = this.page.locator('tr', { has: this.page.getByText(email, { exact: true }) });
    await row.locator('button').nth(0).click();
    await this.commissiondropdown.click()
    await this.page.keyboard.press("ArrowDown")
    await this.page.keyboard.press("Enter")
    await this.referraldropdown.click()
    await this.page.keyboard.press("ArrowDown")
    await this.page.keyboard.press("Enter")  
    await this.submitbtn.click()
    await expect(this.asserter).toBeVisible()
  }
}
