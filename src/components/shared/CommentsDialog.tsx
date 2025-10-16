import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { type AppComment, type MediaItem } from "@/types";
import { getComments, postComment } from "@/api/mediaApi";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface CommentsDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    media: MediaItem;
}

type Inputs = {
    content: string;
};

export function CommentsDialog({
    isOpen,
    onOpenChange,
    media,
}: CommentsDialogProps) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<Inputs>();

    const { data: comments, isLoading } = useQuery({
        queryKey: ["comments", media.media_id],
        queryFn: () => getComments(media.media_id),
        enabled: isOpen, // Загружать комменты только когда диалог открыт
    });

    const postMutation = useMutation({
        mutationFn: postComment,
        onSuccess: () => {
            toast.success("Комментарий добавлен!");
            queryClient.invalidateQueries({
                queryKey: ["comments", media.media_id],
            });
            reset(); // Очищаем форму
        },
        onError: (error) => toast.error(`Ошибка: ${error.message}`),
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        postMutation.mutate({ mediaId: media.media_id, content: data.content });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Комментарии к: {media.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <ScrollArea className="h-72 w-full rounded-md border">
                        <div className="p-4 space-y-4">
                            {isLoading && <p>Загрузка комментариев...</p>}
                            {!isLoading && comments?.length === 0 && (
                                <p className="text-sm text-center text-muted-foreground">
                                    Комментариев пока нет. Будьте первым!
                                </p>
                            )}
                            {comments?.map((comment: AppComment) => (
                                <div
                                    key={comment.comment_id}
                                    className="flex space-x-3"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted"></div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            <Link
                                                to={`/users/${comment.user.user_id}`}
                                                className="hover:underline"
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={`http://localhost:8080${comment.user.avatar_url}`}
                                                    />
                                                    <AvatarFallback>
                                                        {comment.user.user_name.substring(
                                                            0,
                                                            1
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <span className="text-xs text-muted-foreground font-normal ml-2">
                                                {new Date(
                                                    comment.created_at
                                                ).toLocaleString()}
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex gap-2"
                    >
                        <Textarea
                            placeholder="Напишите ваш комментарий..."
                            {...register("content", { required: true })}
                            className="min-h-[40px]"
                        />
                        <Button type="submit" disabled={postMutation.isPending}>
                            {postMutation.isPending ? "..." : "Отправить"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
