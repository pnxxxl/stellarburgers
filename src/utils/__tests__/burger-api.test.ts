import {
  refreshToken,
  fetchWithRefresh,
  getIngredientsApi,
  getFeedsApi,
  getOrdersApi,
  orderBurgerApi,
  getOrderByNumberApi,
  registerUserApi,
  loginUserApi,
  forgotPasswordApi,
  resetPasswordApi,
  getUserApi,
  updateUserApi,
  logoutApi,
} from '../burger-api';
import { getCookie, setCookie } from '../cookie';

jest.mock('../cookie', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
}));

const localStorageMock = (function() {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Мокируем глобальный fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Вспомогательная функция для создания mock-ответов
const createMockResponse = <T>(data: T, ok = true): Response => ({
  ok,
  json: () => Promise.resolve({ success: ok, ...data }),
  headers: new Headers(),
  status: ok ? 200 : 400,
  statusText: ok ? 'OK' : 'Error',
  clone: function() { return this; },
  bodyUsed: false,
  arrayBuffer: function() { return Promise.resolve(new ArrayBuffer(0)); },
  blob: function() { return Promise.resolve(new Blob()); },
  formData: function() { return Promise.resolve(new FormData()); },
  text: function() { return Promise.resolve(''); },
} as Response);

describe('Тесты для burger-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (getCookie as jest.Mock).mockReturnValue('test-access-token');
  });

  describe('Тесты для refreshToken', () => {
    test('Успешное обновление токена', async () => {
      const mockData = {
        refreshToken: 'new-refresh-token',
        accessToken: 'new-access-token',
      };
      localStorage.setItem('refreshToken', 'old-refresh-token');
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await refreshToken();
      
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
      expect(setCookie).toHaveBeenCalledWith('accessToken', 'new-access-token');
    });

    test('Ошибка при обновлении токена', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ message: 'Invalid token' }, false));
      await expect(refreshToken()).rejects.toEqual({
        success: false,
        message: 'Invalid token',
      });
    });
  });

  describe('Тесты для fetchWithRefresh', () => {
    test('Повторный запрос после истечения токена', async () => {
      const errorResponse = { message: 'jwt expired' };
      const refreshResponse = {
        refreshToken: 'new-refresh',
        accessToken: 'new-access',
      };
      const successResponse = { orders: [] };

      mockFetch
        .mockRejectedValueOnce(errorResponse)
        .mockResolvedValueOnce(createMockResponse(refreshResponse))
        .mockResolvedValueOnce(createMockResponse(successResponse));

      const result = await fetchWithRefresh<{orders: []}>(
        'https://test.com/orders',
        { headers: { authorization: 'old-token' } }
      );

      expect(result).toEqual({
        success: true,
        ...successResponse,
      });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Тесты для работы с ингредиентами', () => {
    test('Успешное получение списка ингредиентов', async () => {
      const mockData = {
        data: [
          { _id: '1', name: 'Булка', type: 'bun' },
          { _id: '2', name: 'Котлета', type: 'main' },
        ],
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await getIngredientsApi();
      expect(result).toEqual(mockData.data);
    });
  });

  describe('Тесты для работы с заказами', () => {
    test('Успешное создание заказа', async () => {
      const mockData = {
        order: { number: 12345 },
        name: 'Space бургер',
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await orderBurgerApi(['ing1', 'ing2']);
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });

    test('Получение ленты заказов', async () => {
      const mockData = {
        orders: [],
        total: 100,
        totalToday: 5,
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await getFeedsApi();
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });

    test('Получение заказов пользователя', async () => {
      const mockData = {
        orders: [{ number: 123 }],
        total: 1,
        totalToday: 1,
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await getOrdersApi();
      expect(result).toEqual(mockData.orders);
    });

    test('Получение заказа по номеру', async () => {
      const mockData = {
        orders: [{ number: 12345 }],
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await getOrderByNumberApi(12345);
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });
  });

  describe('Тесты для авторизации', () => {
    test('Успешный вход пользователя', async () => {
      const mockData = {
        accessToken: 'login-token',
        refreshToken: 'refresh-token',
        user: { name: 'Test' },
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await loginUserApi({
        email: 'test@test.com',
        password: '123',
      });
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });

    test('Успешная регистрация пользователя', async () => {
      const mockData = {
        accessToken: 'reg-token',
        refreshToken: 'refresh-token',
        user: { name: 'New User' },
      };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await registerUserApi({
        email: 'new@test.com',
        password: '123',
        name: 'New User',
      });
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });
  });

  describe('Тесты для восстановления пароля', () => {
    test('Запрос на восстановление пароля', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}));
      const result = await forgotPasswordApi({ email: 'test@test.com' });
      expect(result).toEqual({ success: true });
    });

    test('Сброс пароля', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}));
      const result = await resetPasswordApi({
        password: 'new-pass',
        token: 'reset-token',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Тесты для профиля пользователя', () => {
    test('Получение данных пользователя', async () => {
      const mockData = { user: { name: 'Test User' } };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await getUserApi();
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });

    test('Обновление данных пользователя', async () => {
      const mockData = { user: { name: 'Updated Name' } };
      mockFetch.mockResolvedValue(createMockResponse(mockData));

      const result = await updateUserApi({ name: 'Updated Name' });
      expect(result).toEqual({
        success: true,
        ...mockData,
      });
    });
  });
});

