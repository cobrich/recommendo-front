import { type FeedItem, type RecommendationEventDetails } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function RecommendationFeedItem({ item }: { item: FeedItem }) {
    const details = item.details as RecommendationEventDetails;
    return (
        <Card>
            <CardContent className="p-4 text-sm">
                <Link
                    to={`/users/${item.actor.user_id}`}
                    className="font-bold hover:underline"
                >
                    {item.actor.user_name}
                </Link>
                <span> порекомендовал(а) </span>
                <span className="font-semibold">{details.media.name}</span>
                <span> пользователю </span>
                <Link
                    to={`/users/${details.recipient.user_id}`}
                    className="font-bold hover:underline"
                >
                    {details.recipient.user_name}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.created_at).toLocaleString()}
                </p>
            </CardContent>
        </Card>
    );
}
