import { type User } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserListSkeleton } from "./UserListSkeleton";

interface UserListProps {
    users?: User[];
    isLoading: boolean;
    error: Error | null;
    emptyMessage?: string;
}

export function UserList({
    users,
    isLoading,
    error,
    emptyMessage = "Список пуст.",
}: UserListProps) {
    if (isLoading) {
        return <UserListSkeleton count={4} />; // Показываем 4 скелетона
    }
    if (error) {
        return (
            <div className="text-center py-4 text-red-500">
                Ошибка: {error.message}
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
                <Link to={`/users/${user.user_id}`} key={user.user_id}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{user.user_name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
