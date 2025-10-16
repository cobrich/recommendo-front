import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/components/shared/UserList";
import { type RecommendationDetails, type User } from "@/types";
import { SentRecommendationList } from "@/components/shared/SentRecommendationList";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    getUserById,
    getFollowers,
    getFollowings,
    getMyFollowings,
    followUser,
    unfollowUser,
    getMyFriends,
    getFriends,
} from "@/api/userApi";
import { getRecommendations } from "@/api/recommendationApi";
import { RecommendationCardSkeleton } from "@/components/shared/RecommendationCardSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";

// Компонент для отображения полученных рекомендаций
function RecommendationList({
    recommendations,
    isLoading,
}: {
    recommendations?: RecommendationDetails[];
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <RecommendationCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    if (!recommendations || recommendations.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Рекомендаций пока нет.
            </p>
        );
    }
    return (
        <div className="space-y-4">
            {recommendations.map((rec) => (
                <Card key={rec.recommendation_id}>
                    <CardHeader>
                        <CardTitle>
                            {rec.media.name} ({rec.media.year})
                        </CardTitle>
                        <CardDescription>
                            От{" "}
                            <Link
                                to={`/users/${rec.user.user_id}`}
                                className="font-semibold hover:underline"
                            >
                                {rec.user.user_name}
                            </Link>{" "}
                            - {new Date(rec.created_at).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

// Новый компонент для компактной статистики
function UserStats({
    friendsCount,
    followersCount,
    followingsCount,
}: {
    friendsCount?: number;
    followersCount?: number;
    followingsCount?: number;
}) {
    return (
        <div className="flex space-x-4 pt-4 text-sm text-muted-foreground">
            <div>
                <span className="font-bold text-foreground">
                    {friendsCount ?? 0}
                </span>{" "}
                друзей
            </div>
            <div>
                <span className="font-bold text-foreground">
                    {followersCount ?? 0}
                </span>{" "}
                подписчиков
            </div>
            <div>
                <span className="font-bold text-foreground">
                    {followingsCount ?? 0}
                </span>{" "}
                подписок
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useAuth();
    const { openModal } = useModal();
    const queryClient = useQueryClient();

    const {
        data: user,
        isLoading: isUserLoading,
        error: userError,
    } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => getUserById(userId!),
        enabled: !!userId,
    });
    const {
        data: followers,
        isLoading: areFollowersLoading,
        error: followersError,
    } = useQuery({
        queryKey: ["followers", userId],
        queryFn: () => getFollowers(userId!),
        enabled: !!userId,
    });
    const {
        data: followings,
        isLoading: areFollowingsLoading,
        error: followingsError,
    } = useQuery({
        queryKey: ["followings", userId],
        queryFn: () => getFollowings(userId!),
        enabled: !!userId,
    });
    const {
        data: friends,
        isLoading: areFriendsLoading,
        error: friendsError,
    } = useQuery({
        queryKey: ["friends", userId],
        queryFn: () => getFriends(userId!),
        enabled: !!userId,
    });
    const { data: myFollowings } = useQuery({
        queryKey: ["myFollowings"],
        queryFn: getMyFollowings,
        enabled: !!currentUser,
    });
    const { data: myFriends } = useQuery({
        queryKey: ["myFriends"],
        queryFn: getMyFriends,
        enabled: !!currentUser,
    });
    const { data: receivedRecommendations, isLoading: areRecsLoading } =
        useQuery({
            queryKey: ["receivedRecommendations", userId],
            queryFn: () => getRecommendations(userId!, "received"),
            enabled: !!userId,
        });

    const isMyProfile = currentUser?.user_id.toString() === userId;

    const { data: sentRecommendations, isLoading: areSentRecsLoading } =
        useQuery({
            queryKey: ["sentRecommendations"],
            queryFn: () =>
                getRecommendations(currentUser!.user_id.toString(), "sent"),
            enabled: !!currentUser && isMyProfile,
        });

    const followMutation = useMutation({
        mutationFn: followUser,
        // Эта функция сработает ДО отправки запроса на сервер
        onMutate: async () => {
            // 1. Отменяем все текущие перезапросы для 'myFollowings', чтобы они не затерли наши оптимистичные данные
            await queryClient.cancelQueries({ queryKey: ["myFollowings"] });

            // 2. Сохраняем текущее состояние (предыдущий список подписок) на случай отката
            const previousFollowings = queryClient.getQueryData<User[]>([
                "myFollowings",
            ]);

            // 3. Оптимистично обновляем кэш: добавляем нового пользователя в список
            queryClient.setQueryData<User[]>(["myFollowings"], (old) => {
                if (!user) return old; // user - это данные профиля, на котором мы находимся
                // Если старого списка нет, создаем новый. Иначе, добавляем в существующий.
                return old ? [...old, user] : [user];
            });

            // 4. Возвращаем предыдущее состояние в контексте
            return { previousFollowings };
        },
        // Если мутация провалилась, откатываемся к сохраненному состоянию
        onError: (err, _, context) => {
            toast.error(`Не удалось подписаться: ${err.message}`);
            if (context?.previousFollowings) {
                queryClient.setQueryData(
                    ["myFollowings"],
                    context.previousFollowings
                );
            }
        },
        // Эта функция сработает всегда после успеха или ошибки
        onSettled: () => {
            // 5. Делаем финальную синхронизацию с сервером, чтобы убедиться, что все консистентно
            queryClient.invalidateQueries({ queryKey: ["myFollowings"] });
            queryClient.invalidateQueries({ queryKey: ["followers", userId] });
            queryClient.invalidateQueries({ queryKey: ["myFriends"] });
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: unfollowUser,
        onMutate: async (unfollowedUserId) => {
            await queryClient.cancelQueries({ queryKey: ["myFollowings"] });
            const previousFollowings = queryClient.getQueryData<User[]>([
                "myFollowings",
            ]);

            // Оптимистично удаляем пользователя из списка
            queryClient.setQueryData<User[]>(["myFollowings"], (old) => {
                return old?.filter((u) => u.user_id !== unfollowedUserId) || [];
            });

            return { previousFollowings };
        },
        onError: (err, _, context) => {
            toast.error(`Не удалось отписаться: ${err.message}`);
            if (context?.previousFollowings) {
                queryClient.setQueryData(
                    ["myFollowings"],
                    context.previousFollowings
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["myFollowings"] });
            queryClient.invalidateQueries({ queryKey: ["followers", userId] });
            queryClient.invalidateQueries({ queryKey: ["myFriends"] });
        },
    });

    if (isUserLoading)
        return <div className="text-center">Загрузка профиля...</div>;
    if (userError)
        return (
            <div className="text-center text-red-500">
                Не удалось загрузить профиль.
            </div>
        );
    if (!user)
        return <div className="text-center">Пользователь не найден.</div>;

    const isFollowing = myFollowings?.some((f) => f.user_id === user.user_id);
    const areFriends = myFriends?.some(
        (friend) => friend.user_id === user.user_id
    );
    const handleFollow = () => followMutation.mutate(user.user_id);
    const handleUnfollow = () => unfollowMutation.mutate(user.user_id);

    return (
        <div className="flex flex-col gap-8">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <Avatar className="h-16 w-16">
                        <AvatarImage
                            src={
                                user.avatar_url
                                    ? `http://localhost:8080${user.avatar_url}`
                                    : undefined
                            }
                        />
                        <AvatarFallback>
                            {user.user_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl">
                            {user.user_name}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {!isMyProfile && (
                        <UserStats
                            friendsCount={friends?.length}
                            followersCount={followers?.length}
                            followingsCount={followings?.length}
                        />
                    )}
                    <div className="pt-4">
                        {isMyProfile ? (
                            <Button
                                variant="outline"
                                onClick={() => openModal("editProfile")}
                            >
                                Редактировать профиль
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                {isFollowing ? (
                                    <Button
                                        variant="secondary"
                                        onClick={handleUnfollow}
                                        disabled={unfollowMutation.isPending}
                                    >
                                        {unfollowMutation.isPending
                                            ? "Отписка..."
                                            : "Отписаться"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleFollow}
                                        disabled={followMutation.isPending}
                                    >
                                        {followMutation.isPending
                                            ? "Подписка..."
                                            : "Подписаться"}
                                    </Button>
                                )}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span tabIndex={0}>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        openModal(
                                                            "recommendation",
                                                            { user: user }
                                                        )
                                                    }
                                                    disabled={!areFriends}
                                                >
                                                    Рекомендовать
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {!areFriends && (
                                            <TooltipContent>
                                                <p>
                                                    Вы можете рекомендовать
                                                    только друзьям.
                                                </p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isMyProfile ? (
                <Tabs
                    defaultValue="recommendations"
                    className="max-w-4xl mx-auto w-full"
                >
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="recommendations">
                            Полученные ({receivedRecommendations?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="sent_recommendations">
                            Отправленные ({sentRecommendations?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="friends">
                            Друзья ({friends?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="followers">
                            Подписчики ({followers?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="followings">
                            Подписки ({followings?.length || 0})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="recommendations" className="mt-4">
                        <RecommendationList
                            recommendations={receivedRecommendations}
                            isLoading={areRecsLoading}
                        />
                    </TabsContent>
                    <TabsContent value="sent_recommendations" className="mt-4">
                        <SentRecommendationList
                            recommendations={sentRecommendations}
                            isLoading={areSentRecsLoading}
                        />
                    </TabsContent>
                    <TabsContent value="friends" className="mt-4">
                        <UserList
                            users={friends}
                            isLoading={areFriendsLoading}
                            error={friendsError}
                            emptyMessage="У вас пока нет друзей."
                        />
                    </TabsContent>
                    <TabsContent value="followers" className="mt-4">
                        <UserList
                            users={followers}
                            isLoading={areFollowersLoading}
                            error={followersError}
                            emptyMessage="У вас пока нет подписчиков."
                        />
                    </TabsContent>
                    <TabsContent value="followings" className="mt-4">
                        <UserList
                            users={followings}
                            isLoading={areFollowingsLoading}
                            error={followingsError}
                            emptyMessage="Вы еще ни на кого не подписаны."
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="max-w-4xl mx-auto w-full">
                    <h2 className="text-2xl font-semibold mb-4">
                        Рекомендации для {user.user_name}
                    </h2>
                    <RecommendationList
                        recommendations={receivedRecommendations}
                        isLoading={areRecsLoading}
                    />
                </div>
            )}
        </div>
    );
}
