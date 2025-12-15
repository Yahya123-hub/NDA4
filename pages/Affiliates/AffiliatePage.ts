import { Page, Locator, FrameLocator,  expect } from '@playwright/test';
import { USD_RATES } from '../../tests/fixtures/USDRates';

export class AffiliatePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly refbtn: Locator;
  readonly reflink: Locator;
  readonly subbtn : Locator;
  readonly counttext : Locator;
  readonly signupstext : Locator;
  readonly firstpurchasetext :Locator;
  readonly salestext : Locator;
  readonly subscriptionprice : Locator;
  readonly stripeFrame : FrameLocator;
  readonly paymentconfirmer : Locator;
  //readonly currencyamount : Locator;
  readonly stripeconfirmer : Locator;
  readonly currency : Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Email")
    this.passwordInput = page.getByPlaceholder("Password")
    this.loginButton = page.getByRole('button', {name : '🔐 Sign In', exact:true})
    this.counttext = page.locator('h4.text-2xl.font-bold.text-black').first()
    this.signupstext = page.locator('h4.text-2xl.font-bold.text-black').nth(1)
    this.firstpurchasetext = page.locator('h4.text-2xl.font-bold.text-black').nth(2)
    this.salestext = page.locator('h4.text-2xl.font-bold.text-black').nth(3)
    this.paymentconfirmer = page.locator('h1.text-2xl.font-bold.my-4.text-primary')
    this.subscriptionprice = page.locator('div.text-3xl.md\\:text-5xl.font-bold. tracking-tight')
    this.stripeFrame = page.frameLocator('iframe[name="embedded-checkout"]');
    //this.currencyamount = page.locator('#text')
    this.currency = page.locator('span.text-lg');

    this.refbtn = page.locator('a[href="/portal/affiliate/referrals"]')
    this.reflink = page.locator('a[href="http://13.52.122.247/subscription/Userlogin?ref=hEl2I4W-gy"]')
    this.subbtn = page.getByRole('button', {name : 'Monthly'}, )
    this.stripeconfirmer = page.locator('//span[text()="Test Mode"]')

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

    await this.refbtn.click();
    await expect(this.reflink).toBeVisible();

    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'), //wait for new tab event
      this.reflink.click(),                     //then click
    ]);
    //pop catches the newly opened page in popup object which is our new tab

    await popup.waitForLoadState('domcontentloaded'); //wait for popup page html to be loaded
    await expect(popup).toHaveURL(/.*subscription.*/, { timeout: 10000 });
    const popupCTA = popup.locator('button:has-text("Monthly"), button:has-text("Subscribe Now")').first();
    await expect(popupCTA).toBeVisible()

    await popup.close();
    await this.page.goto('http://13.52.122.247/portal/affiliate/dashboard');
    
    const afterText = await this.counttext.textContent();
    const after = Number(afterText?.trim());
    await expect(after).toBe(before + 1);
  }


  async check_salesmetric(    
    stripe: {
      email: string;
      cardNumber: string;
      expDate: string;
      cvc: string;
      billingName: string;
    }) {
  
    const beforesignupText = await this.signupstext.textContent();
    const beforepurchaseText = await this.firstpurchasetext.textContent();
    const beforesalesText = await this.salestext.textContent(); //this would be in usd

    const beforesignup_number = Number(beforesignupText?.trim());
    const beforepurchaseText_number = Number(beforepurchaseText?.trim());
    const beforesalesText_number = Number(beforesalesText?.trim()); //this would be in usd

    await this.refbtn.click();
    await expect(this.reflink).toBeVisible();

    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'), //wait for new tab event
      this.reflink.click(),                     //then click
    ]);
    //pop catches the newly opened page in popup object which is our new tab

    await popup.waitForLoadState('domcontentloaded'); //wait for popup page html to be loaded
    await expect(popup).toHaveURL(/.*subscription.*/, { timeout: 10000 });
    const popupCTA = await popup.locator('button:has-text("Subscribe Now")').first();
    const popupcurrencyl = await popup.locator('div.text-3xl.md\\:text-5xl.font-bold.tracking-tight')
    .first(); 
    const popupcurrency_Text = await popup.locator('div.text-3xl.md\\:text-5xl.font-bold.tracking-tight').
    textContent(); 
    await expect(popupCTA).toBeVisible()
    await popupCTA.click()
    await expect(popupcurrencyl).toBeVisible()
    const finalval = popupcurrency_Text?.replace('/month', " ").trim()

    if(finalval){
    const currency = finalval.slice(0, 3);       // "PKR"
    const amount = Number(finalval.slice(3));    // 42071

    if (!USD_RATES[currency]) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    const usdAmount = Number((amount * USD_RATES[currency]).toFixed(2));

    //get the amount as number along with currency i.e 42000PKR
    //change the 42000PKR to usd then assert that usd is added in totalsales

    await this.fillStripeForm(stripe, popup)
    const popup_paymentconfirmer = popup.locator('h1.text-2xl.font-bold.my-4.text-primary')
    await expect(popup_paymentconfirmer).toBeVisible()

    await popup.close();
    await this.page.goto('http://13.52.122.247/portal/affiliate/dashboard');
    
    await expect(beforesignup_number).toBe(beforesignup_number + 1);
    await expect(beforepurchaseText_number).toBe(beforepurchaseText_number + 1);

    const expectedTotal = Number((beforesalesText_number + usdAmount));
    await expect(this.salestext).toHaveText(expectedTotal.toString())
  }

  }


  async fillStripeForm(stripe: {
  email: string;
  cardNumber: string;
  expDate: string;
  cvc: string;
  billingName: string;
  }, pagePopup : Page) {

  const stripeFrame = pagePopup.frameLocator('iframe[name="embedded-checkout"]');

  await stripeFrame.locator('input#email').fill(stripe.email);
  await stripeFrame.locator('input#cardNumber').fill(stripe.cardNumber);
  await stripeFrame.locator('input#cardExpiry').fill(stripe.expDate);
  await stripeFrame.locator('input#cardCvc').fill(stripe.cvc);
  await stripeFrame.locator('input#billingName').fill(stripe.billingName);
  await stripeFrame.locator('input#billingAddressLine1').fill(stripe.billingName)
  await stripeFrame.locator('input#billingLocality').fill(stripe.billingName)

  const paymentbtn = await stripeFrame.getByRole('button', { name: 'Subscribe', exact: true });
  await expect(paymentbtn).toBeEnabled({timeout :30000})
  await paymentbtn.click()

  }


}
