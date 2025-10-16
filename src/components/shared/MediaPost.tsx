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

export function MediaPost({ media }: { media: MediaItem }) {
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
                    <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-1.5" /> Оценить
                    </Button>
                    <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1.5" /> Комментарии
                    </Button>
                    <Button size="sm">Рекомендовать</Button>
                </div>
            </CardFooter>
        </Card>
    );
}
