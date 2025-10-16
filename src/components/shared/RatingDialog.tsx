import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { type MediaItem } from "@/types";
import { rateMedia } from "@/api/mediaApi";
import { cn } from "@/lib/utils";

interface RatingDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    media: MediaItem;
}

export function RatingDialog({
    isOpen,
    onOpenChange,
    media,
}: RatingDialogProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const queryClient = useQueryClient();

    const rateMutation = useMutation({
        mutationFn: rateMedia,
        onSuccess: () => {
            toast.success(`Вы оценили "${media.name}"`);
            // Инвалидируем все запросы, которые могут содержать медиа, чтобы рейтинг обновился
            queryClient.invalidateQueries({ queryKey: ["topMedia"] });
            onOpenChange(false);
        },
        onError: (error) =>
            toast.error(`Не удалось поставить оценку: ${error.message}`),
    });

    const handleRate = () => {
        if (rating > 0) {
            rateMutation.mutate({ mediaId: media.media_id, score: rating });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Оцените: {media.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 flex justify-center space-x-1">
                    {[...Array(10)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <Star
                                key={starValue}
                                className={cn(
                                    "h-8 w-8 cursor-pointer transition-colors",
                                    starValue <= (hoverRating || rating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                )}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                            />
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleRate}
                        disabled={rating === 0 || rateMutation.isPending}
                    >
                        {rateMutation.isPending ? "Сохранение..." : "Оценить"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
