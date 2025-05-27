import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  loginUserThunk,
  registerUserThunk,
  logoutUserThunk,
  updateUserThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  getUserThunk,
  userInitialState,
  clearUserError
} from '../userSlice';

const setupStore = () =>
  configureStore({
    reducer: {
      user: userReducer
    }
  });

describe('Полное тестирование userSlice', () => {
  describe('Тестирование редьюсеров', () => {
    test('Тестирование очистки ошибки через clearUserError', () => {
      const store = setupStore();
      store.dispatch({
        type: loginUserThunk.rejected.type,
        error: { message: 'Test error' }
      });
      store.dispatch(clearUserError());
      const state = store.getState().user;
      expect(state.error).toBeNull();
    });
  });

  describe('Тестирование селекторов', () => {
    test('Тестирование получения полного состояния', () => {
      const initialState = userReducer(undefined, { type: 'TEST_ACTION' });
      expect(initialState).toEqual({
        isLoading: false,
        user: null,
        isAuthorized: false,
        error: null
      });
    });

    test('Тестирование получения данных пользователя', () => {
      const store = setupStore();
      const state = store.getState();
      expect(state.user.user).toEqual(userInitialState.user);
    });

    test('Тестирование проверки авторизации', () => {
      const store = setupStore();
      const state = store.getState();
      expect(state.user.isAuthorized).toBe(userInitialState.isAuthorized);
    });

    test('Тестирование получения ошибки', () => {
      const store = setupStore();
      const state = store.getState();
      expect(state.user.error).toBe(userInitialState.error);
    });
  });

  describe('Тестирование асинхронных экшенов', () => {
    describe('Авторизация пользователя', () => {
      test('Тестирование состояния pending', () => {
        const store = setupStore();
        store.dispatch({ type: loginUserThunk.pending.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('Тестирование ошибки', () => {
        const store = setupStore();
        const error = 'Auth error';
        store.dispatch({
          type: loginUserThunk.rejected.type,
          error: { message: error }
        });
        const state = store.getState().user;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(error);
      });

      test('Тестирование успешной авторизации', () => {
        const mockResponse = {
          user: {
            email: 'dashasir555@gmail.com',
            name: 'Daria Sirotina'
          },
          accessToken: 'mockToken',
          refreshToken: 'mockRefreshToken'
        };
        const store = setupStore();
        store.dispatch({
          type: loginUserThunk.fulfilled.type,
          payload: mockResponse
        });
        const state = store.getState().user;
        expect(state.user).toEqual(mockResponse.user);
        expect(state.isAuthorized).toBe(true);
        expect(state.isLoading).toBe(false);
      });
    });

    describe('Регистрация пользователя', () => {
      test('Тестирование состояния pending', () => {
        const store = setupStore();
        store.dispatch({ type: registerUserThunk.pending.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('Тестирование ошибки', () => {
        const store = setupStore();
        const error = 'Registration error';
        store.dispatch({
          type: registerUserThunk.rejected.type,
          error: { message: error }
        });
        const state = store.getState().user;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(error);
      });

      test('Тестирование успешной регистрации', () => {
        const mockResponse = {
          user: {
            email: 'dashasir555@gmail.com',
            name: 'Daria Sirotina'
          },
          accessToken: 'mockToken',
          refreshToken: 'mockRefreshToken'
        };
        const store = setupStore();
        store.dispatch({
          type: registerUserThunk.fulfilled.type,
          payload: mockResponse
        });
        const state = store.getState().user;
        expect(state.user).toEqual(mockResponse.user);
        expect(state.isAuthorized).toBe(true);
      });
    });

    describe('Обновление данных пользователя', () => {
      test('Тестирование состояния pending', () => {
        const store = setupStore();
        store.dispatch({ type: updateUserThunk.pending.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('Тестирование ошибки', () => {
        const store = setupStore();
        const error = 'Update error';
        store.dispatch({
          type: updateUserThunk.rejected.type,
          error: { message: error }
        });
        const state = store.getState().user;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(error);
      });

      test('Тестирование успешного обновления', () => {
        const updatedUser = {
          email: 'dashasir555@gmail.com',
          name: 'Daria Sirotina Updated'
        };
        const store = setupStore();
        store.dispatch({
          type: updateUserThunk.fulfilled.type,
          payload: { user: updatedUser }
        });
        const state = store.getState().user;
        expect(state.user).toEqual(updatedUser);
      });
    });

    describe('Выход из системы', () => {
      test('Тестирование успешного выхода', () => {
        const store = setupStore();
        store.dispatch({ type: logoutUserThunk.fulfilled.type });
        const state = store.getState().user;
        expect(state.user).toBeNull();
        expect(state.isAuthorized).toBe(false);
      });
    });

    describe('Восстановление пароля', () => {
      test('Тестирование успешного запроса', () => {
        const store = setupStore();
        store.dispatch({ type: forgotPasswordThunk.fulfilled.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
      });
    });

    describe('Сброс пароля', () => {
      test('Тестирование состояния pending', () => {
        const store = setupStore();
        store.dispatch({ type: resetPasswordThunk.pending.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('Тестирование успешного сброса', () => {
        const store = setupStore();
        store.dispatch({ type: resetPasswordThunk.fulfilled.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
      });
    });

    describe('Получение данных пользователя', () => {
      test('Тестирование состояния pending', () => {
        const store = setupStore();
        store.dispatch({ type: getUserThunk.pending.type });
        const state = store.getState().user;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test('Тестирование успешного получения', () => {
        const mockUser = {
          email: 'dashasir555@gmail.com',
          name: 'Daria Sirotina'
        };
        const store = setupStore();
        store.dispatch({
          type: getUserThunk.fulfilled.type,
          payload: { user: mockUser }
        });
        const state = store.getState().user;
        expect(state.user).toEqual(mockUser);
        expect(state.isAuthorized).toBe(true);
      });
    });
  });
});