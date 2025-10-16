import { deleteRecommendation } from "@/api/recommendationApi";
import type { RecommendationDetails } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { RecommendationCardSkeleton } from "./RecommendationCardSkeleton";

interface SentRecommendationListProps {
    recommendations?: RecommendationDetails[];
    isLoading: boolean;
}

export function SentRecommendationList({
    recommendations,
    isLoading,
}: SentRecommendationListProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteRecommendation,
        onSuccess: () => {
            toast.success("Recommendation Deleted successfully!");
            queryClient.invalidateQueries({
                queryKey: ["sentRecommendations"],
            });
        },
        onError: (error) => {
            toast.error(`Failed delete recommendation: ${error.message}`);
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <RecommendationCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    if (!recommendations || recommendations.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Вы еще не отправляли рекомендаций.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {recommendations.map((rec) => (
                <Card
                    key={rec.recommendation_id}
                    className="flex items-center justify-between p-4"
                >
                    <div>
                        <CardTitle className="text-lg">
                            {rec.media.name}
                        </CardTitle>
                        <CardDescription>
                            Рекомендовано пользователю:{" "}
                            <span className="font-semibold">
                                {rec.user.user_name}
                            </span>
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            deleteMutation.mutate(rec.recommendation_id)
                        }
                        disabled={deleteMutation.isPending}
                        aria-label="Удалить рекомендацию"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </Card>
            ))}
        </div>
    );
}
