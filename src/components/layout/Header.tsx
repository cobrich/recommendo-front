import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link to="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold">Recommendo</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium ml-6">
                    <Link
                        to="/community"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Community
                    </Link>
                </nav>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Светлая
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Темная
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setTheme("system")}
                            >
                                Системная
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {user ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    navigate(`/users/${user.user_id}`)
                                }
                            >
                                <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage
                                        src={`http://localhost:8080${user.avatar_url}`}
                                    />
                                    <AvatarFallback>
                                        {user.user_name.substring(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                {user.user_name}
                            </Button>
                            <Button
                                onClick={logout}
                                size="icon"
                                variant="outline"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <nav className="flex items-center space-x-2">
                            <Button asChild variant="ghost">
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Register</Link>
                            </Button>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}
