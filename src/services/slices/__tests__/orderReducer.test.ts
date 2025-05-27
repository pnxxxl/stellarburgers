import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import orderReducer, { getOrderThunk } from '../orderSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      order: orderReducer
    }
  });

describe('Тестирование работы с заказами', () => {
  describe('Проверка асинхронных операций', () => {
    test('Устанавливает статус загрузки при начале запроса', () => {
      const store = createTestStore();
      store.dispatch({ type: getOrderThunk.pending.type });
      
      const { order } = store.getState();
      expect(order.isLoading).toBe(true);
      expect(order.error).toBeNull();
    });

    test('Обрабатывает ошибку при неудачном запросе', () => {
      const store = createTestStore();
      const testError = 'Ошибка 404: Заказ не найден';
      store.dispatch({
        type: getOrderThunk.rejected.type,
        error: { message: testError }
      });
      
      const { order } = store.getState();
      expect(order.isLoading).toBe(false);
      expect(order.error).toBe(testError);
    });

    test('Корректно сохраняет данные заказа при успешном запросе', () => {
      const mockOrder = {
        _id: '6610a8e497ede0001d064b2a',
        ingredients: [
          '643d69a5c3f7b9001cfa0946', // Хрустящие минеральные кольца
          '643d69a5c3f7b9001cfa093d', // Флюоресцентная булка R2-D3
          '643d69a5c3f7b9001cfa094a'  // Сыр с астероидной плесенью
        ],
        owner: '65db1c0a97ede0001d05e2d6',
        status: 'done',
        name: 'Минеральный космический бургер',
        createdAt: '2025-05-27T19:20:20.123Z',
        updatedAt: '2025-05-27T19:20:20.456Z',
        number: 79112
      };
      
      const store = createTestStore();
      store.dispatch({
        type: getOrderThunk.fulfilled.type,
        payload: { orders: [mockOrder] }
      });
      
      const { order } = store.getState();
      expect(order.isLoading).toBe(false);
      expect(order.error).toBeNull();
      expect(order.order).toEqual(mockOrder);
    });
  });

  describe('Проверка структуры данных заказа', () => {
    test('Содержит все обязательные поля', () => {
      const testOrder = {
        _id: '6610a8e497ede0001d064b2b',
        ingredients: [
          '643d69a5c3f7b9001cfa0943', // Соус фирменный Space Sauce
          '643d69a5c3f7b9001cfa093d'  // Флюоресцентная булка R2-D3
        ],
        owner: '65db1c0a97ede0001d05e2d6',
        status: 'pending',
        name: 'Space флюоресцентный бургер',
        createdAt: '2025-05-27T20:25:30.789Z',
        updatedAt: '2025-05-27T20:25:30.999Z',
        number: 79113
      };
      
      const store = createTestStore();
      store.dispatch({
        type: getOrderThunk.fulfilled.type,
        payload: { orders: [testOrder] }
      });
      
      const { order } = store.getState();
      expect(order.order).toHaveProperty('_id');
      expect(order.order).toHaveProperty('ingredients');
      expect(order.order).toHaveProperty('status');
      expect(order.order).toHaveProperty('name');
      expect(order.order).toHaveProperty('number');
    });
  });
});