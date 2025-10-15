import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/components/shared/UserList";
import { toast } from "sonner";
import { RecommendationDialog } from "@/components/shared/RecommendationDialog";
import { type RecommendationDetails } from "@/types";

import { getUserById, getFollowers, getFollowings, getMyFollowings, followUser, unfollowUser } from "@/api/userApi";
import { getRecommendations } from "@/api/recommendationApi";

function RecommendationList({ recommendations }: { recommendations?: RecommendationDetails[] }) {
    if (!recommendations || recommendations.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">Рекомендаций пока нет.</p>;
    }
    return (
        <div className="space-y-4">
            {recommendations.map(rec => (
                <Card key={rec.recommendation_id}>
                    <CardHeader>
                        <CardTitle>{rec.media.name} ({rec.media.year})</CardTitle>
                        <CardDescription>
                            От <span className="font-semibold">{rec.user.user_name}</span> - {new Date(rec.created_at).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}


export default function ProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isRecommendationDialogOpen, setRecommendationDialogOpen] = useState(false);

    const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => getUserById(userId!),
        enabled: !!userId,
    });

    const { data: followers, isLoading: areFollowersLoading, error: followersError } = useQuery({
        queryKey: ['followers', userId],
        queryFn: () => getFollowers(userId!),
        enabled: !!userId,
    });
    
    const { data: followings, isLoading: areFollowingsLoading, error: followingsError } = useQuery({
        queryKey: ['followings', userId],
        queryFn: () => getFollowings(userId!),
        enabled: !!userId,
    });

    const { data: myFollowings } = useQuery({
        queryKey: ['myFollowings'],
        queryFn: getMyFollowings,
        enabled: !!currentUser,
    });

    // Query для получения рекомендаций
    const { data: recommendations, isLoading: areRecsLoading } = useQuery({
        queryKey: ['recommendations', userId],
        queryFn: () => getRecommendations(userId!),
        enabled: !!userId,
    });
    
    const followMutation = useMutation({
        mutationFn: followUser,
        onSuccess: () => {
            toast.success(`Вы подписались на ${user?.user_name}`);
            queryClient.invalidateQueries({ queryKey: ['followers', userId] });
            queryClient.invalidateQueries({ queryKey: ['myFollowings'] });
        },
        onError: (error) => toast.error(`Не удалось подписаться: ${error.message}`)
    });

    const unfollowMutation = useMutation({
        mutationFn: unfollowUser,
        onSuccess: () => {
            toast.info(`Вы отписались от ${user?.user_name}`);
            queryClient.invalidateQueries({ queryKey: ['followers', userId] });
            queryClient.invalidateQueries({ queryKey: ['myFollowings'] });
        },
        onError: (error) => toast.error(`Не удалось отписаться: ${error.message}`)
    });

    if (isUserLoading) return <div className="text-center">Загрузка профиля...</div>;
    if (userError) return <div className="text-center text-red-500">Не удалось загрузить профиль.</div>;
    if (!user) return <div className="text-center">Пользователь не найден.</div>;

    const isMyProfile = currentUser?.user_id === user.user_id;
    const isFollowing = myFollowings?.some(f => f.user_id === user.user_id);
    
    const handleFollow = () => followMutation.mutate(user.user_id);
    const handleUnfollow = () => unfollowMutation.mutate(user.user_id);

    return (
        <>
            <div className="flex flex-col gap-8">
                <Card className="max-w-4xl mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="text-3xl">{user.user_name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="pt-4">
                            {isMyProfile ? (
                                <Button variant="outline">Редактировать профиль</Button>
                            ) : (
                                <div className="flex space-x-2">
                                    {isFollowing ? (
                                        <Button variant="secondary" onClick={handleUnfollow} disabled={unfollowMutation.isPending}>
                                            {unfollowMutation.isPending ? 'Отписка...' : 'Отписаться'}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleFollow} disabled={followMutation.isPending}>
                                            {followMutation.isPending ? 'Подписка...' : 'Подписаться'}
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setRecommendationDialogOpen(true)}>
                                        Рекомендовать
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="recommendations" className="max-w-4xl mx-auto w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="recommendations">Рекомендации ({recommendations?.length || 0})</TabsTrigger>
                        <TabsTrigger value="followers">Подписчики ({followers?.length || 0})</TabsTrigger>
                        <TabsTrigger value="followings">Подписки ({followings?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="recommendations" className="mt-4">
                        {areRecsLoading ? <p>Загрузка...</p> : <RecommendationList recommendations={recommendations} />}
                    </TabsContent>

                    <TabsContent value="followers" className="mt-4">
                        <UserList users={followers} isLoading={areFollowersLoading} error={followersError} emptyMessage="У этого пользователя пока нет подписчиков."/>
                    </TabsContent>
                    
                    <TabsContent value="followings" className="mt-4">
                        <UserList users={followings} isLoading={areFollowingsLoading} error={followingsError} emptyMessage="Этот пользователь еще ни на кого не подписан."/>
                    </TabsContent>
                </Tabs>
            </div>
            {!isMyProfile && (
                <RecommendationDialog 
                    isOpen={isRecommendationDialogOpen}
                    onOpenChange={setRecommendationDialogOpen}
                    recipient={user}
                />
            )}
        </>
    );
}