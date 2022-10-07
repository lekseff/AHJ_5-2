import { createPopper } from '@popperjs/core';

/**
 * Управляет модальным окном
 */
export default class Modal {
  constructor(container) {
    this.container = container;
    this.saveButtonListener = []; // Об события на кнопке Сохранить

    this.registerEvents();
  }

  registerEvents() {
    const saveButton = this.container.querySelector('.popup__button_save');
    const cancelButton = this.container.querySelector('.popup__button_cancel');
    saveButton.addEventListener('click', this.onSave.bind(this));
    cancelButton.addEventListener('click', this.onCancel.bind(this));
  }

  /**
   * Добавляем обработчик по кнопке сохранить
   * @param {*} callback - callback
   */
  addSaveListener(callback) {
    this.saveButtonListener.push(callback);
  }

  /**
   * Действие по кнопке сохранить
   */
  onSave(event) {
    event.preventDefault();
    this.validateForm();
  }

  /**
   * Действие по кнопке отмена
   */
  onCancel(event) {
    event.preventDefault();
    this.onClose();
    this.clearForm();
  }

  /**
   * Показывает окно
   */
  onOpen() {
    // console.log(this.container);
    this.container.classList.remove('hidden');
  }

  /**
   * Закрывает окно
   */
  onClose() {
    this.container.classList.add('hidden');
  }

  /**
   * Устанавливает значения в поля ввода при редактировании
   * @param {*} name - Название товара
   * @param {*} price - Цена товара
   */
  setInputValue(name, price) {
    this.container.querySelector('#popup-name').value = name;
    this.container.querySelector('#popup-price').value = price;
  }

  /**
   * Получаем данные из формы
   * @returns - массив объектов с данными формы
   */
  getFormData() {
    const form = this.container.querySelector('#popup-form');
    const data = {};
    const formData = Array.from(form.elements)
      .filter((item) => item.name !== '')
      .map((elem) => {
        const { name, value } = elem;
        return { name, value };
      });
    // Меняем формат полученный данных
    for (const item of formData) {
      data[item.name] = item.value.trim();
    }
    return data;
  }

  /**
   * Очистка полей ввода
   */
  clearForm() {
    this.container.querySelector('#popup-form').reset();
  }

  /**
   * Валидация формы
   * @param {*} param0 -
   */
  validateForm() {
    const data = this.getFormData();
    const name = data.name.trim();
    const price = data.price.trim();
    const nameField = this.container.querySelector('#popup-name');
    const priceField = this.container.querySelector('#popup-price');

    if (name === '') {
      this.showError(nameField, 'Заполните поле');
      return;
    }

    if (price === '') {
      this.showError(priceField, 'Заполните поле');
      return;
    }

    if (!/^\d+$/g.test(price)) {
      this.showError(priceField, 'Поле может содержать только цифры');
      return;
    }

    // Если прошла валидация
    data.price = Number.parseInt(data.price, 10);
    this.saveButtonListener.forEach((o) => o.call(null, data));
    this.clearForm();
  }

  /**
   * Показывает сообщение с ошибкой
   * @param {*} element - Элемент у которого показать подсказку
   * @param {*} text - Текст сообщения
   */
  showError(element, text) {
    const errorTooltip = this.container.querySelector('#error-tooltip');
    const popperInstance = createPopper(element, errorTooltip, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 6],
          },
        },
      ],
    });
    errorTooltip.querySelector('#error-message').textContent = text;
    errorTooltip.setAttribute('data-show', '');
    popperInstance.update();
    // element.focus();
    setTimeout(() => {
      errorTooltip.removeAttribute('data-show');
    }, 2500);
  }
}
