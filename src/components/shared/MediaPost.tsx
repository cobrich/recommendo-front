import { Link } from "react-router-dom";
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
import { MessageCircle, Star, Send } from "lucide-react";

interface MediaPostProps {
    media: MediaItem;
    onRecommend: (media: MediaItem) => void;
    onRate: (media: MediaItem) => void;
    onComment: (media: MediaItem) => void;
}

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
                    <Link
                        to={`/media/${media.media_id}`}
                        className="hover:underline"
                    >
                        {media.name} ({media.year})
                    </Link>
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
                {/* Левая часть: Статистика */}
                <TooltipProvider>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Tooltip>
                            <TooltipTrigger className="flex items-center">
                                <Send className="h-4 w-4 mr-1.5" />
                                {media.recommendation_count}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Recommend count</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger
                                className="flex items-center"
                                onClick={() => onComment(media)}
                            >
                                <MessageCircle className="h-4 w-4 mr-1.5" />
                                {media.comment_count}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Comments</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger
                                className="flex items-center"
                                onClick={() => onRate(media)}
                            >
                                <Star className="h-4 w-4 mr-1.5 text-yellow-500" />
                                {media.avg_rating.toFixed(1)} (
                                {media.rating_count})
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Avarage rate</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>

                {/* Правая часть: Основные действия */}
                <div className="flex space-x-2">
                    <Button size="sm" onClick={() => onRecommend(media)}>
                        Рекомендовать
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
