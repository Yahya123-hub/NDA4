import { Page, Locator, expect } from '@playwright/test';

export class AffiliatePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly refbtn: Locator;
  readonly reflink: Locator;
  readonly subbtn : Locator;
  readonly counttext : Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Email")
    this.passwordInput = page.getByPlaceholder("Password")
    this.loginButton = page.getByRole('button', {name : '🔐 Sign In', exact:true})
    this.counttext = page.locator('h4.text-2xl.font-bold.text-black').first()

    this.refbtn = page.locator('a[href="/portal/affiliate/referrals"]')
    this.reflink = page.locator('a[href="http://13.52.122.247/subscription/Userlogin?ref=hEl2I4W-gy"]')
    this.subbtn = page.getByRole('button', {name : 'Monthly'}, )

  }

  async goto() {
    await this.page.goto('http://13.52.122.247/auth/login'); 
  }

  async gotoaffiliate() {
    await this.page.goto('http://13.52.122.247/portal/affiliate/dashboard'); 
  }


  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginSuccess() {
  await expect(this.page).toHaveURL(/.*portal.*/, { timeout: 30000 });
  }

  async check_clickmetric() {
    const beforeText = await this.counttext.textContent();
    const before = Number(beforeText?.trim());

    await this.counttext.textContent()
    await this.refbtn.click()
    await expect(this.reflink).toBeVisible()
    await this.reflink.click() // new tab opens after this
    await expect(this.page).toHaveURL(/.*subscription.*/, { timeout: 30000 });
    await this.page.goto('http://13.52.122.247/portal/affiliate/dashboard'); 

    const afterText = await this.counttext.textContent();
    const after = Number(afterText?.trim());
    await expect(after).toBe(before + 1);
  }
}
