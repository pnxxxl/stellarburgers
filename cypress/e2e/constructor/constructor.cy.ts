import { URL } from '@api';
import { deleteCookie, setCookie } from '../../../src/utils/cookie';

describe('Конструктор бургеров', () => {
  beforeEach(() => {
    // Устанавливаем тестовые токены авторизации
    setCookie('accessToken', 'Bearer test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    
    // Мокаем API-запросы для тестов
    cy.intercept('GET', `${URL}//auth/user`, {fixture: 'user.json'}).as('getUser');
    cy.intercept('GET', `${URL}/ingredients`, {fixture: 'ingredients.json'}).as('getIngredients');
    
    cy.visit(''); // Переход на главную страницу
    cy.wait('@getUser'); // Ожидаем загрузки пользователя
  });

  afterEach(() => {
    // Очищаем данные авторизации после каждого теста
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  });

  it('Загрузка и отображение ингредиентов', () => {
    cy.get('[data-cy="constructor"]').as('constructor');
    
    // Добавляем ингредиенты разных категорий
    ['Булки', 'Начинки', 'Соусы'].forEach(type => 
      cy.addIngredient(type) // Кастомная команда для добавления
    );

    // Проверяем отображение конкретных ингредиентов
    ['Краторная булка N-200i', 'Биокотлета из марсианской Магнолии', 'Соус Spicy-X']
      .forEach(text => cy.get('@constructor').should('contain', text));
  });

  it('Работа модального окна ингредиента', () => {
    // Функция для повторяющихся действий с модалкой
    const modalActions = () => {
      cy.get('[data-cy="modal"]').as('modal')
        .should('exist') // Проверяем что модалка открылась
        .should('contain', 'Краторная булка N-200i'); // С нужным содержимым
      
      cy.get('[data-cy="modal-close"]').click(); // Закрываем модалку
      cy.get('@modal').should('not.exist'); // Проверяем что закрылась
    };

    // Тестируем открытие/закрытие модалки
    cy.get('[data-cy="ingredient-item"]').first().click();
    modalActions();
    
    // Тестируем закрытие через оверлей
    cy.get('[data-cy="ingredient-item"]').first().click();
    cy.get('[data-cy="modal-overlay"]').click('left', {force: true});
    cy.get('@modal').should('not.exist');
  });

  it('Оформление заказа', () => {
    // Мокаем запрос на создание заказа
    cy.intercept('POST', `${URL}/orders`, {fixture: 'order.json'}).as('orderBurgerApi');
    cy.get('[data-cy="constructor"]').as('constructor');

    // Добавляем ингредиенты в конструктор
    ['Булки', 'Начинки', 'Соусы'].forEach(type => 
      cy.addIngredient(type)
    );

    // Оформляем заказ (force: true на случай если кнопка перекрыта другими элементами)
    cy.get('@constructor').find('button').click({ multiple: true, force: true});
    
    // Проверяем модалку с номером заказа
    cy.get('[data-cy="modal"]').should('contain', '79110').and('be.visible');
    cy.get('[data-cy="modal-close"]').click(); // Закрываем модалку

    // Проверяем что конструктор очистился
    ['Биокотлета из марсианской Магнолии', 'Краторная булка N-200i', 'Соус Spicy-X']
      .forEach(text => cy.get('@constructor').should('not.contain', text));
    
    cy.wait('@orderBurgerApi'); // Ожидаем выполнения API-запроса
  });
});