import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  // URL вашего Go бэкенда. Убедитесь, что он запущен!
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Это "перехватчик" (interceptor). Он будет срабатывать ПЕРЕД каждым запросом.
// Его задача - достать токен из localStorage и добавить его в заголовок Authorization.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;