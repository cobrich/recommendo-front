import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Пока идет проверка токена, показываем загрузку
    return <div>Проверка авторизации...</div>;
  }
  
  // Если проверка завершена и пользователь не авторизован, перенаправляем на логин
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};