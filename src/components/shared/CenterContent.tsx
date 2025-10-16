import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopMedia } from "@/api/mediaApi";
import { MediaPost } from "./MediaPost";
import { MediaPostSkeleton } from "./MediaPostSkeleton";
import { RecommendationDialog } from "./RecommendationDialog";
import { type MediaItem } from "@/types";
import { RatingDialog } from "./RatingDialog";

export function CenterContent() {
    const [isRecDialogOpen, setRecDialogOpen] = useState(false);
    const [isRateDialogOpen, setRateDialogOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    const {
        data: topMedia,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["topMedia"],
        queryFn: getTopMedia,
    });

    const handleRecommendClick = (media: MediaItem) => {
        setSelectedMedia(media);
        setRecDialogOpen(true);
    };

    const handleRateClick = (media: MediaItem) => {
        setSelectedMedia(media);
        setRateDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <MediaPostSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error)
        return <p className="text-red-500">Не удалось загрузить топ медиа.</p>;

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Самое рекомендуемое</h2>
                {topMedia?.map((media) => (
                    <MediaPost
                        key={media.media_id}
                        media={media}
                        onRecommend={handleRecommendClick}
                        onRate={handleRateClick}
                    />
                ))}
            </div>
            {selectedMedia && (
                <>
                    <RecommendationDialog
                        isOpen={isRecDialogOpen}
                        onOpenChange={setRecDialogOpen}
                        media={selectedMedia}
                    />
                    <RatingDialog
                        isOpen={isRateDialogOpen}
                        onOpenChange={setRateDialogOpen}
                        media={selectedMedia}
                    />
                </>
            )}
        </>
    );
}
