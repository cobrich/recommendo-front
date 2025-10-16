import { useQuery } from "@tanstack/react-query";
import { getTopMedia } from "@/api/mediaApi";
import { MediaPost } from "./MediaPost";
import { MediaPostSkeleton } from "./MediaPostSkeleton";

export function CenterContent() {
    const {
        data: topMedia,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["topMedia"],
        queryFn: getTopMedia,
    });

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
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Самое рекомендуемое</h2>
            {topMedia?.map((media) => (
                <MediaPost key={media.media_id} media={media} />
            ))}
        </div>
    );
}
