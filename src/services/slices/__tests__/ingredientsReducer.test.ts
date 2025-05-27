import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer, { getIngredientsThunk } from '../ingredientsSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      ingredients: ingredientsReducer
    }
  });

describe('Тесты для среза ингредиентов', () => {
  describe('Тестирование асинхронного запроса ингредиентов', () => {
    test('Должен установить флаг загрузки при начале запроса', () => {
      const store = createTestStore();
      store.dispatch({ type: getIngredientsThunk.pending.type });
      
      const { ingredients } = store.getState();
      expect(ingredients.isLoading).toBe(true);
      expect(ingredients.error).toBeNull();
    });

    test('Должен сохранить ошибку при неудачном запросе', () => {
      const store = createTestStore();
      const testError = 'Ошибка 500: Internal Server Error';
      store.dispatch({
        type: getIngredientsThunk.rejected.type,
        error: { message: testError }
      });
      
      const { ingredients } = store.getState();
      expect(ingredients.isLoading).toBe(false);
      expect(ingredients.error).toBe(testError);
    });

    test('Должен сохранить ингредиенты при успешном запросе', () => {
      const mockIngredients = [
        {
          _id: '643d69a5c3f7b9001cfa093d',
          name: 'Флюоресцентная булка R2-D3',
          type: 'bun',
          proteins: 44,
          fat: 26,
          carbohydrates: 85,
          calories: 643,
          price: 988,
          image: 'https://code.s3.yandex.net/react/code/bun-01.png',
          image_mobile: 'https://code.s3.yandex.net/react/code/bun-01-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/bun-01-large.png',
          __v: 0
        },
        {
          _id: '643d69a5c3f7b9001cfa0941',
          name: 'Биокотлета из марсианской Магнолии',
          type: 'main',
          proteins: 420,
          fat: 142,
          carbohydrates: 242,
          calories: 4242,
          price: 424,
          image: 'https://code.s3.yandex.net/react/code/meat-01.png',
          image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
          __v: 0
        }
      ];
      
      const store = createTestStore();
      store.dispatch({
        type: getIngredientsThunk.fulfilled.type,
        payload: mockIngredients
      });
      
      const { ingredients } = store.getState();
      expect(ingredients.isLoading).toBe(false);
      expect(ingredients.error).toBeNull();
      expect(ingredients.ingredients).toEqual(mockIngredients);
    });
  });
});