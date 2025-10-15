import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './router';
import { Toaster } from "@/components/ui/sonner"
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    // Оборачиваем все в BrowserRouter
    <BrowserRouter> 
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;