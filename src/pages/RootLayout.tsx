import { Header } from '@/components/layout/Header';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <Header />
      <main className="flex-grow container py-8">
        <Outlet />
      </main>
    </div>
  );
}