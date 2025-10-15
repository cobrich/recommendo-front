import apiClient from "@/api";
import { type PaginatedResponse, type User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Функция для получения данных с бэкенда
const fetchUsers = async () => {
    const { data } = await apiClient.get<PaginatedResponse<User>>('/users');
    return data.data; // Возвращаем только массив пользователей
}

export default function HomePage() {
    // Tanstack Query будет управлять состоянием запроса за нас
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['allUsers'], // Уникальный ключ для кэширования этого запроса
        queryFn: fetchUsers    // Функция, которая выполняет запрос
    });

    if(isLoading) return <div className="text-center">Загрузка пользователей...</div>
    if(error) return <div className="text-center text-red-500">Ошибка при загрузке: {error.message}</div>

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Все пользователи</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {users?.map(user => (
                    <Link to={`/users/${user.user_id}`} key={user.user_id}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle>{user.user_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}