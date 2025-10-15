import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import RootLayout from '@/pages/RootLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export const AppRouter = () => {
  // Теперь здесь только Routes и Route, без BrowserRouter
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/users/:userId" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
};