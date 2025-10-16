import { type MediaItem } from "@/types";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Star, ThumbsUp } from "lucide-react";

interface MediaPostProps {
    media: MediaItem;
    onRecommend: (media: MediaItem) => void;
    onRate: (media: MediaItem) => void;
    onComment: (media: MediaItem) => void;
}

export function MediaPost({
    media,
    onRecommend,
    onRate,
    onComment,
}: MediaPostProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {media.name} ({media.year})
                </CardTitle>
                <CardDescription>
                    {media.author} - {media.item_type}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    Здесь будет краткое описание медиа, которое мы добавим в
                    будущем. Пока это просто заглушка.
                </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 mr-1.5" />
                    {media.recommendation_count}
                </div>
                <div className="flex space-x-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-1.5 text-yellow-400" />
                        {media.avg_rating.toFixed(1)} ({media.rating_count})
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRate(media)}
                    >
                        <Star className="h-4 w-4 mr-1.5" /> Rate
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onComment(media)}
                    >
                        <MessageCircle className="h-4 w-4 mr-1.5" /> Comment
                    </Button>
                    <Button size="sm" onClick={() => onRecommend(media)}>
                        Recommend
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
