// src/components/shared/SuggestedUsers.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type User } from "@/types";
import { followUser, getMyFollowings } from "@/api/userApi";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";

// Новая API-функция, которая будет бить в новый эндпоинт
const getSuggestedUsers = async () => {
    const { data } = await apiClient.get<{ data: User[] }>(
        "/users/suggested?limit=10"
    );
    return data.data;
};

export function SuggestedUsers() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
        queryKey: ["suggestedUsers"],
        queryFn: getSuggestedUsers,
    });
    const { data: myFollowings, isLoading: isLoadingFollowings } = useQuery({
        queryKey: ["myFollowings"],
        queryFn: getMyFollowings,
        enabled: !!currentUser,
    });

    const followMutation = useMutation({
        mutationFn: followUser,
        onSuccess: (followedUserId) => {
            toast.success("Вы успешно подписались!");
            // Обновляем ленту и мои подписки
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({
                queryKey: ["myFollowings"],
            });
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

    const suggestedUsers = allUsers
        ?.filter((user) => {
            if (user.user_id === currentUser?.user_id) return false;
            const isAlreadyFollowing = myFollowings?.some(
                (following) => following.user_id === user.user_id
            );
            if (isAlreadyFollowing) return false;
            return true;
        })
        .slice(0, 7); // Возьмем 7 для примера

    if (isLoading) {
        return (
            <div className="flex space-x-4 pb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-32 h-40 border rounded-lg p-3 flex flex-col items-center justify-center space-y-2"
                    >
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>
        );
    }

    if (!suggestedUsers || suggestedUsers.length === 0) return null;

    return (
        <div>
            <h3 className="font-semibold mb-4">Кого читать</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                {suggestedUsers.map((user) => (
                    <div
                        key={user.user_id}
                        className="flex-shrink-0 w-32 border bg-card rounded-lg p-3 text-center flex flex-col items-center"
                    >
                        {/* Placeholder for Avatar */}
                        <div className="w-12 h-12 rounded-full bg-muted mb-2"></div>
                        <Link
                            to={`/users/${user.user_id}`}
                            className="font-semibold text-sm hover:underline truncate w-full"
                        >
                            <Avatar className="w-12 h-12 mb-2">
                                <AvatarImage
                                    src={`http://localhost:8080${user.avatar_url}`}
                                />
                                <AvatarFallback>
                                    {user.user_name.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <p className="text-xs text-muted-foreground truncate w-full">
                            {user.email}
                        </p>
                        <Button
                            size="sm"
                            className="mt-auto w-full"
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
            </div>
        </div>
    );
}
