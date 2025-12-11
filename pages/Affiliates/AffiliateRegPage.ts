import { Page, Locator, expect } from '@playwright/test';

export class AffiliateRegPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly paypalEmailInput: Locator;
  readonly channelsInput: Locator; 
  readonly businessModelInput: Locator; 
  readonly countryInput: Locator; 
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly signUpButton: Locator;
  readonly signupAsserter : Locator;
  readonly yesbtn : Locator;
  readonly confirmer : Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('input[name="first_name"]');
    this.lastNameInput = page.locator('input[name="last_name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.paypalEmailInput = page.locator('input[name="paypal_email"]');
    this.channelsInput = page.locator('#channels');
    this.businessModelInput = page.locator('#business_model');
    this.countryInput = page.locator('#country');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirm_password"]');
    this.termsCheckbox = page.locator('label[for="terms"]');
    this.signUpButton = page.getByRole('button', { name: /Sign Up/i, exact: false });
    this.signupAsserter = page.getByText("Confirmation!!!", {exact:true})
    this.yesbtn = page.locator('//button[text()="Yes, Proceed"]')
    this.confirmer = page.getByText('Account created successfully and OTP sent to your email', {exact:true})
  }

  async fillPersonalDetails(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    paypalEmail?: string;
  }) {
    if (data.firstName !== undefined) await this.firstNameInput.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastNameInput.fill(data.lastName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.paypalEmail !== undefined) await this.paypalEmailInput.fill(data.paypalEmail);
  }

  async selectAutocomplete(field: 'channels' | 'business_model' | 'country', value: string) {
    const locator = field === 'channels' ? 
    this.channelsInput : field === 'business_model' ? 
    this.businessModelInput : this.countryInput;

    await locator.click();
    await this.page.keyboard.press("ArrowDown")
    await this.page.keyboard.press("Enter")
  }

  async fillPasswords(password: string, confirmPassword?: string) {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
  }

  async acceptTerms() {
    if (!(await this.termsCheckbox.isChecked())) {
      await this.termsCheckbox.click();
    }
  }

  async submit() {
    await expect(this.signUpButton).toBeVisible();
    await expect(this.signUpButton).toBeEnabled();
    await this.signUpButton.click();
  }

  async signUp(data: {
    firstName: string;
    lastName: string;
    email: string;
    paypalEmail?: string;
    channels?: string; 
    businessModel?: string;
    country?: string;
    password: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  }) {
    await this.fillPersonalDetails({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      paypalEmail: data.paypalEmail ?? data.email,
    });

    if (data.channels) await this.selectAutocomplete('channels', data.channels);
    if (data.businessModel) await this.selectAutocomplete('business_model', data.businessModel);
    if (data.country) await this.selectAutocomplete('country', data.country);

    await this.fillPasswords(data.password, data.confirmPassword);

    if (data.acceptTerms ?? true) {
      await this.acceptTerms();
    }

    await this.submit();
    await expect(this.signupAsserter).toBeVisible()
    await this.yesbtn.click()
    await expect(this.confirmer).toBeVisible()
    //till otp

  }
}
