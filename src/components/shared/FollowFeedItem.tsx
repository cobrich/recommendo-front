import { type FeedItem, type FollowEventDetails } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function FollowFeedItem({ item }: { item: FeedItem }) {
    const details = item.details as FollowEventDetails;
    return (
        <Card>
            <CardContent className="p-4 text-sm">
                <Link
                    to={`/users/${item.actor.user_id}`}
                    className="font-bold hover:underline"
                >
                    {item.actor.user_name}
                </Link>
                <span> подписался(ась) на </span>
                <Link
                    to={`/users/${details.followed_user.user_id}`}
                    className="font-bold hover:underline"
                >
                    {details.followed_user.user_name}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.created_at).toLocaleString()}
                </p>
            </CardContent>
        </Card>
    );
}
