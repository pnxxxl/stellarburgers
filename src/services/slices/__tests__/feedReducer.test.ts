import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import feedReducer, { getFeedThunk, getOrdersThunk } from '../feedSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      feed: feedReducer
    }
  });

describe('Тестирование работы с лентой заказов', () => {
  describe('Проверка экшенов основной ленты', () => {
    test('Состояние загрузки при запросе ленты', () => {
      const store = createTestStore();
      store.dispatch({ type: getFeedThunk.pending.type });
      const currentState = store.getState().feed;
      
      expect(currentState.isLoading).toBe(true);
      expect(currentState.error).toBeNull();
    });

    test('Обработка ошибки при запросе ленты', () => {
      const store = createTestStore();
      const testError = 'Ошибка сервера 500';
      store.dispatch({
        type: getFeedThunk.rejected.type,
        error: { message: testError }
      });
      const currentState = store.getState().feed;
      
      expect(currentState.isLoading).toBe(false);
      expect(currentState.error).toEqual(testError);
    });

    test('Успешное получение данных ленты', () => {
      const testData = {
        orders: [{
          _id: '6610a8e497ede0001d064b2a',
          ingredients: [
            '643d69a5c3f7b9001cfa0946',
            '643d69a5c3f7b9001cfa093d',
            '643d69a5c3f7b9001cfa094a'
          ],
          status: 'created',
          name: 'Минеральный космический бургер',
          createdAt: '2025-05-27T21:20:20.123Z',
          updatedAt: '2025-05-27T21:20:20.456Z',
          number: 79116
        }],
        total: 79116,
        totalToday: 28
      };
      const store = createTestStore();
      store.dispatch({
        type: getFeedThunk.fulfilled.type,
        payload: testData
      });
      const currentState = store.getState().feed;
      
      expect(currentState.isLoading).toBe(false);
      expect(currentState.error).toBeNull();
      expect(currentState.orders).toEqual(testData.orders);
      expect(currentState.total).toBe(testData.total);
      expect(currentState.totalToday).toBe(testData.totalToday);
    });
  });

  describe('Проверка экшенов персональной ленты', () => {
    test('Состояние загрузки при запросе персональных заказов', () => {
      const store = createTestStore();
      store.dispatch({ type: getOrdersThunk.pending.type });
      const currentState = store.getState().feed;
      
      expect(currentState.isLoading).toBe(true);
      expect(currentState.error).toBeNull();
    });

    test('Обработка ошибки при запросе персональных заказов', () => {
      const store = createTestStore();
      const testError = 'Ошибка авторизации 401';
      store.dispatch({
        type: getOrdersThunk.rejected.type,
        error: { message: testError }
      });
      const currentState = store.getState().feed;
      
      expect(currentState.isLoading).toBe(false);
      expect(currentState.error).toEqual(testError);
    });

    test('Успешное получение персональных заказов', () => {
      const testOrder = {
        _id: '6610a8e497ede0001d064b2b',
        ingredients: [
          '643d69a5c3f7b9001cfa0943',
          '643d69a5c3f7b9001cfa0946',
          '643d69a5c3f7b9001cfa094a'
        ],
        status: 'pending',
        name: 'Астероидный минеральный бургер',
        createdAt: '2025-05-27T21:20:20.123Z',
        updatedAt: '2025-05-27T21:20:20.456Z',
        number: 79116
      };
      const store = createTestStore();
      store.dispatch({
        type: getOrdersThunk.fulfilled.type,
        payload: testOrder
      });
      const currentState = store.getState().feed;
      
      expect(currentState.isLoading).toBe(false);
      expect(currentState.error).toBeNull();
      expect(currentState.orders).toEqual(testOrder);
    });
  });
});