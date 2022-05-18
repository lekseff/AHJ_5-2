/* eslint-disable no-await-in-loop */
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
      headless: false, // show gui
      slowMo: 250,
      devtools: true, // show devTools
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test('Проверка появления popup', async () => {
    await page.goto(baseUrl);
    const addButton = await page.$('.header__button');
    await addButton.click();
    await page.waitFor(() => !document.querySelector('.popup.hidden'));
  });

  test('Добавляем элемент продукта', async () => {
    await page.goto(baseUrl);
    const addButton = await page.$('.header__button');
    const nameInput = await page.$('#popup-name');
    const priceInput = await page.$('#popup-price');
    const saveButton = await page.$('.popup__button_save');
    await addButton.click();
    await nameInput.focus();
    await nameInput.type('Телевизор');
    await priceInput.focus();
    await priceInput.type('20000');
    await saveButton.click();
    await page.waitFor('.product__item');
  });

  test('Удаление элемента', async () => {
    await page.goto(baseUrl);
    const addButton = await page.$('.header__button');
    const nameInput = await page.$('#popup-name');
    const priceInput = await page.$('#popup-price');
    const saveButton = await page.$('.popup__button_save');
    await addButton.click();
    await nameInput.focus();
    await nameInput.type('Телевизор');
    await priceInput.focus();
    await priceInput.type('20000');
    await saveButton.click();
    const removeButton = await page.$('.product__button_remove');
    await removeButton.click();
    await page.waitFor(() => !document.querySelector('.product__item'));
  });

  test('Редактирование элемента', async () => {
    await page.goto(baseUrl);
    const addButton = await page.$('.header__button');
    const nameInput = await page.$('#popup-name');
    const priceInput = await page.$('#popup-price');
    const saveButton = await page.$('.popup__button_save');
    await addButton.click();
    await nameInput.focus();
    await nameInput.type('Телевизор', { delay: 200 });
    await priceInput.focus();
    await priceInput.type('20000', { delay: 200 });
    await saveButton.click();
    const editButton = await page.$('.product__button_edit');
    await editButton.click();
    // Проверяем, что окно открылось
    await page.waitFor(() => !document.querySelector('.popup.hidden'));
    // Проверка, что поля заполнены
    await page.waitFor(() => document.querySelector('#popup-name').value === 'Телевизор');
    await page.waitFor(() => document.querySelector('#popup-price').value === '20000');
    // Редактируем
    await priceInput.focus();
    // Удаляем старое значение в поле стоимость
    for (let i = 0; i < 'Телевизор'.length; i += 1) {
      await page.keyboard.press('Delete');
    }
    // Пишем новое значение
    await priceInput.type('5000');
    await saveButton.click();
    await page.waitFor(() => document.querySelector('.product__price').textContent === '5000');
  });
});
