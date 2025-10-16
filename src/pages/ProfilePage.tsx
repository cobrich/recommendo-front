import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { RecommendationDialog } from "@/components/shared/RecommendationDialog";
import { type RecommendationDetails } from "@/types";
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
import { EditProfileDialog } from "@/components/shared/EditProfileDialog";
import { RecommendationCardSkeleton } from "@/components/shared/RecommendationCardSkeleton";

// --- КОМПОНЕНТЫ ДЛЯ РАЗНЫХ СЦЕНАРИЕВ ---

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
    const [isRecommendationDialogOpen, setRecommendationDialogOpen] =
        useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    // --- ЗАПРОСЫ ДАННЫХ (остаются без изменений) ---
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

    // --- МУТАЦИИ (остаются без изменений) ---
    const followMutation = useMutation({
        mutationFn: followUser,
        onSuccess: () => {
            /* ... */
        },
    });
    const unfollowMutation = useMutation({
        mutationFn: unfollowUser,
        onSuccess: () => {
            /* ... */
        },
    });

    // --- ЛОГИКА РЕНДЕРА ---
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
        <>
            <div className="flex flex-col gap-8">
                <Card className="max-w-4xl mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="text-3xl">
                            {user.user_name}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* --- НАЧАЛО ГЛАВНОГО ИЗМЕНЕНИЯ --- */}
                        {/* Если это НЕ мой профиль, показываем компактную статистику */}
                        {!isMyProfile && (
                            <UserStats
                                friendsCount={friends?.length}
                                followersCount={followers?.length}
                                followingsCount={followings?.length}
                            />
                        )}
                        {/* --- КОНЕЦ ГЛАВНОГО ИЗМЕНЕНИЯ --- */}

                        <div className="pt-4">
                            {isMyProfile ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(true)}
                                >
                                    Редактировать профиль
                                </Button>
                            ) : (
                                <div className="flex space-x-2">
                                    {isFollowing ? (
                                        <Button
                                            variant="secondary"
                                            onClick={handleUnfollow}
                                            disabled={
                                                unfollowMutation.isPending
                                            }
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
                                                            setRecommendationDialogOpen(
                                                                true
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

                {/* --- УСЛОВНЫЙ РЕНДЕР ТАБОВ --- */}
                {/* Если это МОЙ профиль, показываем все табы */}
                {isMyProfile ? (
                    <Tabs
                        defaultValue="recommendations"
                        className="max-w-4xl mx-auto w-full"
                    >
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="recommendations">
                                Полученные (
                                {receivedRecommendations?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="sent_recommendations">
                                Отправленные ({sentRecommendations?.length || 0}
                                )
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
                        <TabsContent
                            value="sent_recommendations"
                            className="mt-4"
                        >
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
                    // Если это ЧУЖОЙ профиль, показываем только рекомендации
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

            {!isMyProfile && (
                <RecommendationDialog
                    isOpen={isRecommendationDialogOpen}
                    onOpenChange={setRecommendationDialogOpen}
                    recipient={user}
                />
            )}
            {isMyProfile && (
                <EditProfileDialog
                    isOpen={isEditDialogOpen}
                    onOpenChange={setEditDialogOpen}
                />
            )}
        </>
    );
}
