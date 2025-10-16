// src/components/shared/SuggestedUsers.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { type User } from "@/types";
import { followUser, getMyFollowings } from "@/api/userApi"; // Импортируем getMyFollowings
import { useAuth } from "@/hooks/useAuth"; // Импортируем useAuth
import apiClient from "@/api";
import { type PaginatedResponse } from "@/types";

const fetchAllUsers = async () => {
    // Запрашиваем чуть больше пользователей, т.к. будем фильтровать
    const { data } = await apiClient.get<PaginatedResponse<User>>(
        "/users?limit=10"
    );
    return data.data;
};

export function SuggestedUsers() {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth(); // Получаем текущего пользователя

    // Запрос 1: Получаем список всех пользователей
    const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["suggestedUsers"],
        queryFn: fetchAllUsers,
    });

    // Запрос 2: Получаем список моих подписок
    const { data: myFollowings, isLoading: isLoadingFollowings } = useQuery({
        queryKey: ["myFollowings"],
        queryFn: getMyFollowings,
        enabled: !!currentUser, // Выполнять, только если мы авторизованы
    });

    const followMutation = useMutation({
        mutationFn: followUser,
        onSuccess: (_, followedUserId) => {
            toast.success("Вы успешно подписались!");
            // Обновляем ленту и мои подписки
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["myFollowings"] });
            // Можно также вручную обновить список suggestedUsers, чтобы кнопка исчезла
            queryClient.setQueryData(
                ["suggestedUsers"],
                (oldData: User[] | undefined) => {
                    return (
                        oldData?.filter((u) => u.user_id !== followedUserId) ||
                        []
                    );
                }
            );
        },
        onError: (error) => {
            toast.error(`Не удалось подписаться: ${error.message}`);
        },
    });

    const isLoading = isLoadingUsers || isLoadingFollowings;

    // --- ЛОГИКА ФИЛЬТРАЦИИ ---
    const suggestedUsers = allUsers
        ?.filter((user) => {
            // 1. Исключаем самого себя
            if (user.user_id === currentUser?.user_id) {
                return false;
            }
            // 2. Исключаем тех, на кого уже подписаны
            // (проверяем, есть ли user.user_id в массиве myFollowings)
            const isAlreadyFollowing = myFollowings?.some(
                (following) => following.user_id === user.user_id
            );
            if (isAlreadyFollowing) {
                return false;
            }
            return true;
        })
        .slice(0, 5); // Оставляем только 5 пользователей после фильтрации

    // ... (код для скелетона остается таким же) ...
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Кого читать</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between"
                        >
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!suggestedUsers || suggestedUsers.length === 0) {
        return null; // Если после фильтрации никого не осталось, ничего не показываем
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Кого читать</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestedUsers.map((user) => (
                    <div
                        key={user.user_id}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <Link
                                to={`/users/${user.user_id}`}
                                className="font-semibold hover:underline"
                            >
                                {user.user_name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => followMutation.mutate(user.user_id)}
                            disabled={
                                followMutation.isPending &&
                                followMutation.variables === user.user_id
                            }
                        >
                            Читать
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
