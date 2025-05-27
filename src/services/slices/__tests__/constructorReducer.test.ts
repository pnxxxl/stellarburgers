import { expect, test, describe } from '@jest/globals';
import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientDown,
  moveIngredientUp,
  constructorInitialState
} from '../constructorSlice';
import type { constructorState } from '../constructorSlice';
import { nanoid } from '@reduxjs/toolkit';
import { TConstructorIngredient } from '@utils-types';

jest.mock('@reduxjs/toolkit', () => ({
  ...jest.requireActual('@reduxjs/toolkit'),
  nanoid: jest.fn(() => 'unique-test-id')
}));

describe('Тесты редьюсера конструктора бургеров', () => {
  const mockState: constructorState = {
    ...constructorInitialState,
    constructorItems: {
      bun: {
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
        id: 'space-bun'
      },
      ingredients: [
        {
          _id: '643d69a5c3f7b9001cfa0946',
          name: 'Хрустящие минеральные кольца',
          type: 'main',
          proteins: 808,
          fat: 689,
          carbohydrates: 609,
          calories: 986,
          price: 300,
          image: 'https://code.s3.yandex.net/react/code/mineral_rings.png',
          image_mobile: 'https://code.s3.yandex.net/react/code/mineral_rings-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/mineral_rings-large.png',
          id: 'mineral-rings'
        },
        {
          _id: '643d69a5c3f7b9001cfa0943',
          name: 'Соус фирменный Space Sauce',
          type: 'sauce',
          proteins: 50,
          fat: 22,
          carbohydrates: 11,
          calories: 14,
          price: 80,
          image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
          image_mobile: 'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/sauce-04-large.png',
          id: 'space-sauce'
        }
      ]
    }
  };

  test('Добавление нового ингредиента', () => {
    const newIngredient = {
      _id: '643d69a5c3f7b9001cfa094a',
      name: 'Сыр с астероидной плесенью',
      type: 'main',
      proteins: 84,
      fat: 48,
      carbohydrates: 420,
      calories: 3377,
      price: 4142,
      image: 'https://code.s3.yandex.net/react/code/cheese.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/cheese-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/cheese-large.png'
    };

    const expectedState = JSON.parse(JSON.stringify(mockState));
    expectedState.constructorItems.ingredients.push({
      ...newIngredient,
      id: 'unique-test-id'
    });

    const result = constructorReducer(
      mockState,
      addIngredient(newIngredient)
    );
    
    expect(nanoid).toHaveBeenCalled();
    expect(result).toEqual(expectedState);
  });

  test('Удаление ингредиента', () => {
    const ingredientIdToRemove = 'mineral-rings';
    const expectedState = JSON.parse(JSON.stringify(mockState));
    expectedState.constructorItems.ingredients = 
      expectedState.constructorItems.ingredients.filter(
        (item: TConstructorIngredient) => item.id !== ingredientIdToRemove
      );

    const result = constructorReducer(
      mockState,
      removeIngredient(ingredientIdToRemove)
    );

    expect(result).toEqual(expectedState);
  });

  describe('Изменение порядка ингредиентов', () => {
    test('Перемещение ингредиента вверх', () => {
      const ingredientIndex = 1;
      const expectedState = JSON.parse(JSON.stringify(mockState));
      
      const [first, second] = expectedState.constructorItems.ingredients;
      expectedState.constructorItems.ingredients = [second, first];

      const result = constructorReducer(
        mockState,
        moveIngredientUp(ingredientIndex)
      );
      
      expect(result).toEqual(expectedState);
    });

    test('Перемещение ингредиента вниз', () => {
      const ingredientIndex = 0;
      const expectedState = JSON.parse(JSON.stringify(mockState));
      
      const [first, second] = expectedState.constructorItems.ingredients;
      expectedState.constructorItems.ingredients = [second, first];

      const result = constructorReducer(
        mockState,
        moveIngredientDown(ingredientIndex)
      );
      
      expect(result).toEqual(expectedState);
    });
  });
});