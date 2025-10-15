import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">Recommendo</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate(`/users/${user.user_id}`)}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  {user.user_name}
                </Button>
                <Button onClick={logout} size="icon" variant="outline">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <nav className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/login">Войти</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Регистрация</Link>
                </Button>
              </nav>
            )}
        </div>
      </div>
    </header>
  );
}