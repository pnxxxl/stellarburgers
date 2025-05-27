import { expect, test, describe } from '@jest/globals';
import { rootReducer } from '@store';
import {
  userInitialState,
  orderInitialState,
  ingredientsInitialState,
  feedInitialState,
  constructorInitialState
} from '@slices';

describe('Тест корневого редьюсера', () => {
  const initialState = {
    user: { ...userInitialState },
    feed: { ...feedInitialState },
    order: { ...orderInitialState },
    ingredients: { ...ingredientsInitialState },
    constructorbg: { ...constructorInitialState }
  };

  test('Должен возвращать начальное состояние при инициализации', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = rootReducer(undefined, action);
    expect(newState).toEqual(initialState);
  });

  test('Должен содержать все необходимые слайсы', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = rootReducer(undefined, action);
    
    expect(newState.user).toBeDefined();
    expect(newState.feed).toBeDefined();
    expect(newState.order).toBeDefined();
    expect(newState.ingredients).toBeDefined();
    expect(newState.constructorbg).toBeDefined();
  });
});