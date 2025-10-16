import { useQuery } from "@tanstack/react-query";
import { getFeed } from "@/api/feedApi";
import { type FeedItem } from "@/types";
import { RecommendationFeedItem } from "@/components/shared/RecommendationFeedItem";
import { FollowFeedItem } from "@/components/shared/FollowFeedItem";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestedUsers } from "@/components/shared/SuggestedUsers";

// Скелетон для ленты
function FeedSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export default function HomePage() {
    const {
        data: feedItems,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["feed"],
        queryFn: getFeed,
    });

    const renderFeedItem = (item: FeedItem) => {
        switch (item.type) {
            case "recommendation":
                return (
                    <RecommendationFeedItem
                        key={`${item.type}-${item.created_at}`}
                        item={item}
                    />
                );
            case "follow":
                return (
                    <FollowFeedItem
                        key={`${item.type}-${item.created_at}`}
                        item={item}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Лента активности</h1>

            {isLoading && <FeedSkeleton />}
            {error && (
                <div className="text-center text-red-500">
                    Не удалось загрузить ленту: {error.message}
                </div>
            )}
            {!isLoading && feedItems?.length === 0 && (
                <div className="space-y-8 text-center">
                    <p className="text-muted-foreground">
                        Ваша лента пока пуста. Подпишитесь на кого-нибудь, чтобы
                        видеть их активность.
                    </p>
                    <div className="text-left">
                        <SuggestedUsers />
                    </div>
                </div>
            )}
            {!isLoading && feedItems && (
                <div className="space-y-4">{feedItems.map(renderFeedItem)}</div>
            )}
        </div>
    );
}
