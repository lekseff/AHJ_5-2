import { v4 as uuidv4 } from 'uuid';
import Modal from './Modal';

export default class CRM {
  constructor(container) {
    this.container = container;
    this.addButton = null; // Кнопка добавить
    this.productsItems = null; // Список добавленных товаров
    this.popup = null;
    this.isEdit = { status: false, id: null }; // Состояние редактирования
    this.db = []; // База данных продуктов
  }

  /**
   * Старт приложения
   */
  init() {
    this.addButton = this.container.querySelector('[data-button="add"]');
    this.productsItems = this.container.querySelector('.products__list-items');
    this.popup = new Modal(this.container.querySelector('.popup'));

    this.eventRegister();
    this.checkEmpty(); // Проверка на пустой список
  }

  /**
   * Установка обработчиков событий
   */
  eventRegister() {
    this.addButton.addEventListener('click', this.addButtonHandler.bind(this));
    this.productsItems.addEventListener('click', this.productItemHandler.bind(this));
    this.popup.addSaveListener(this.saveProduct.bind(this));
  }

  /**
   * Добавляет продукт по кнопке добавить
   */
  addButtonHandler() {
    this.popup.onOpen();
  }

  /**
   * Обработчик событий на блоке с продуктами
   * @param {*} event -
   */
  productItemHandler(event) {
    const currentEl = event.target;
    if (currentEl.tagName !== 'BUTTON') return;

    const parentEl = currentEl.closest('.product__item');
    const { id } = parentEl.dataset;

    // Удаление элемента
    if (currentEl.classList.contains('product__button_remove')) {
      parentEl.remove();
      // Удаляем из базы данных
      this.db = this.db.filter((elem) => elem.id !== id);
      this.checkEmpty(); // Проверка на пустой список
    }

    // Редактирование элемента
    if (currentEl.classList.contains('product__button_edit')) {
      const { name, price } = this.db.find((elem) => elem.id === id);
      this.popup.onOpen();
      this.popup.setInputValue(name, price);
      this.isEdit.status = true;
      this.isEdit.id = id;
    }
  }

  saveProduct(data) {
    // Проверяем редактируем или добавляем новый продукт
    if (this.isEdit.status) {
      // Получаем элемент и проставляем значения
      const editHtmlElement = this.productsItems.querySelector(`[data-id="${this.isEdit.id}"]`);
      editHtmlElement.querySelector('.product__name').textContent = data.name;
      editHtmlElement.querySelector('.product__price').textContent = data.price;

      // Обновляем данные в базе данных
      const editElement = this.db.find((item) => item.id === this.isEdit.id);
      editElement.name = data.name;
      editElement.price = data.price;

      // Убираем редактирование
      this.isEdit.status = false;
    } else {
      // Добавляем продукт в список
      const element = this.constructor.createProductItem(data);
      this.productsItems.append(element);
      // Сохраняем элемент в массиве
      this.db.push({ id: element.dataset.id, ...data });
      this.checkEmpty(); // Проверка на пустой список
    }
    this.popup.onClose();
  }

  /**
   * Создает html элемент списка товаров
   * @param {object} data - Название и стоимость
   * @returns html элемент
   */
  static createProductItem(data) {
    const id = uuidv4();
    const { name, price } = data;
    const productItem = document.createElement('div');
    const productName = document.createElement('div');
    const productPrice = document.createElement('div');
    const productButtons = document.createElement('div');
    const productButtonEdit = document.createElement('button');
    const productButtonRemove = document.createElement('button');

    productItem.classList.add('product__item');
    productItem.dataset.id = id;

    productName.classList.add('product__name');
    productName.textContent = name;
    productItem.append(productName);

    productPrice.classList.add('product__price');
    productPrice.textContent = price;
    productItem.append(productPrice);

    productButtons.classList.add('product__buttons');
    productButtonEdit.classList.add('product__button', 'product__button_edit');
    productButtonRemove.classList.add('product__button', 'product__button_remove');
    productButtons.append(productButtonEdit);
    productButtons.append(productButtonRemove);
    productItem.append(productButtons);

    return productItem;
  }

  /**
   * Проверка на пустой список
   */
  checkEmpty() {
    if (this.db.length === 0) {
      this.container.querySelector('.products__list-no_items').classList.remove('hidden');
      this.container.querySelector('.products__list-title').classList.add('hidden');
    } else if (this.db.length === 1) {
      this.container.querySelector('.products__list-no_items').classList.add('hidden');
      this.container.querySelector('.products__list-title').classList.remove('hidden');
    }
  }
}
