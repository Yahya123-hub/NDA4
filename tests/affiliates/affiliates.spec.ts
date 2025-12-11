import { test, expect } from '@playwright/test';
import { AffiliateRegPage } from '../../pages/Affiliates/AffiliateRegPage';
import { LoginPage } from '../../pages/Affiliates/LoginPage';
import { AffiliatePage } from '../../pages/Affiliates/AffiliatePage';
import { testData } from '../fixtures/testData';


test.describe.serial('Affiliate registration', () => {
  
  test.skip('User can sign up as an affiliate', async ({ page }) => {
    const affiliate = new AffiliateRegPage(page);
    await page.goto(testData.urls.signup);

    const unique = Date.now();

    const firstName = testData?.affiliate?.firstName ?? 'Test';
    const lastName = testData?.affiliate?.lastName ?? 'User';
    const email = `qa+affiliate+${unique}@example.com`;
    const channels = testData?.affiliate?.channels ?? 'Blog';
    const businessModel = testData?.affiliate?.businessModel ?? 'Content';
    const country = testData?.affiliate?.country ?? 'Pakistan';
    const password = testData?.affiliate?.password ?? 'Passw0rd!@#123';
  
    await affiliate.signUp({
      firstName,
      lastName,
      email,
      paypalEmail: email,
      channels,
      businessModel,
      country,
      password,
    });

  });

  test.skip('Affiliate user gets approved from admin', async({page})=>{
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      testData.adminlogin.Email,
      testData.adminlogin.Password
    );
    await loginPage.expectLoginSuccess();
    await loginPage.approveaffiliate(testData.affiliate_email_tobeapproved.email)

  })

  test('Affiliate dashboard click info updates correctly', async({page})=>{
    const affiliatepage = new AffiliatePage(page);
    await affiliatepage.goto();
    await affiliatepage.login(
      testData.affiliatelogin.Email,
      testData.affiliatelogin.Password
    );
    await affiliatepage.expectLoginSuccess();
    await affiliatepage.check_clickmetric()

  })
});
