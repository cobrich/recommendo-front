import { useQuery } from "@tanstack/react-query";
import { getFeed } from "@/api/feedApi";
import { type FeedItem } from "@/types";
import { RecommendationFeedItem } from "@/components/shared/RecommendationFeedItem";
import { FollowFeedItem } from "@/components/shared/FollowFeedItem";
import { Skeleton } from "@/components/ui/skeleton";

function FeedSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg bg-card">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export function ActivityFeed() {
    const { data: feedItems, isLoading, error } = useQuery({
        queryKey: ['feed'],
        queryFn: getFeed
    });

    const renderFeedItem = (item: FeedItem) => {
        // Используем ID из вложенных объектов для более надежного ключа
        const key = `${item.type}-${item.actor.user_id}-${item.created_at}`;
        switch (item.type) {
            case 'recommendation':
                return <RecommendationFeedItem key={key} item={item} />;
            case 'follow':
                return <FollowFeedItem key={key} item={item} />;
            default:
                return null;
        }
    };

    if (isLoading) return <FeedSkeleton />;
    if (error) return <div className="text-center text-red-500">Не удалось загрузить ленту: {error.message}</div>;
    
    if (feedItems?.length === 0) {
        return <p className="text-center text-sm text-muted-foreground py-4">Ваша лента пока пуста.</p>;
    }

    return (
        <div className="space-y-4">
            {feedItems?.map(renderFeedItem)}
        </div>
    );
}