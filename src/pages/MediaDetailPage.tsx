import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMediaById } from "@/api/mediaApi";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { MediaPostSkeleton } from "@/components/shared/MediaPostSkeleton";
import { CommentsDialog } from "@/components/shared/CommentsDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function MediaDetailPage() {
    const { mediaId } = useParams<{ mediaId: string }>();
    const [isCommentsOpen, setCommentsOpen] = useState(false);

    const {
        data: media,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["media", mediaId],
        queryFn: () => getMediaById(mediaId!),
        enabled: !!mediaId,
    });

    if (isLoading) return <MediaPostSkeleton />;
    if (error)
        return <p className="text-red-500">Не удалось загрузить данные.</p>;
    if (!media) return <p>Медиа не найдено.</p>;

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">
                            {media.name} ({media.year})
                        </CardTitle>
                        <CardDescription>
                            {media.author} -{" "}
                            {media.tags.map((tag) => tag.name).join(", ")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Здесь будет полное описание, трейлер и другая
                            информация.
                        </p>
                        <div className="mt-4">
                            <Button onClick={() => setCommentsOpen(true)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Показать комментарии ({media.comment_count})
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CommentsDialog
                isOpen={isCommentsOpen}
                onOpenChange={setCommentsOpen}
                media={media}
            />
        </>
    );
}
