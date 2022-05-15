import puppeteer from 'puppeteer';
import { fork } from 'child_process';

jest.setTimeout(30000); // default puppeteer timeout

describe('Credit Card Validator form', () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = 'http://localhost:9000';

  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppeteer.launch({
      // headless: false, // show gui
      // slowMo: 250,
      // devtools: true, // show devTools
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test.each([
    ['maestro', '6772742259014549862'],
    ['visa', '4960147956718208'],
    ['mastercard', '5472146019720845'],
    ['amexp', '375117485929854'],
    ['jcb', '3562995574833351'],
    ['discover', '6011991981279367588'],
    ['diners', '36076941062307'],
    ['unionpay', '6259427708773239'],
    ['mir', '2200238127479053'],
  ])(('Test type: %s'), async (type, number) => {
    await page.goto(baseUrl);
    const input = await page.$('#number');
    await input.type(number);
    await page.waitForSelector(`.${type}-color`);
    await page.waitForSelector(`.${type}`);
  });
});
