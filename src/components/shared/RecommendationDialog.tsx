// src/components/shared/RecommendationDialog.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { createRecommendation, searchMedia } from "@/api/recommendationApi";
import { getMyFriends } from "@/api/userApi";
import { type MediaItem, type User } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface RecommendationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    // Теперь мы можем передать либо получателя, либо медиа
    recipient?: User;
    media?: MediaItem;
}

export function RecommendationDialog({
    isOpen,
    onOpenChange,
    recipient,
    media,
}: RecommendationDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(
        media || null
    );
    const [selectedFriend, setSelectedFriend] = useState<User | null>(
        recipient || null
    );

    const queryClient = useQueryClient();
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Сбрасываем состояние при закрытии/открытии окна
    useEffect(() => {
        if (isOpen) {
            setSelectedMedia(media || null);
            setSelectedFriend(recipient || null);
            setSearchTerm("");
        }
    }, [isOpen, media, recipient]);

    // --- Запросы данных ---
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ["mediaSearch", debouncedSearchTerm],
        queryFn: () => searchMedia(debouncedSearchTerm),
        enabled: !media && debouncedSearchTerm.length > 2, // Искать медиа, только если оно не передано
    });

    const { data: friends, isLoading: isLoadingFriends } = useQuery({
        queryKey: ["myFriends"],
        queryFn: getMyFriends,
        enabled: isOpen && !recipient, // Загружать друзей, только если получатель не передан
    });

    // --- Мутация ---
    const recommendationMutation = useMutation({
        mutationFn: createRecommendation,
        onSuccess: () => {
            toast.success(`Рекомендация успешно отправлена!`);
            if (selectedFriend) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "recommendations",
                        selectedFriend.user_id.toString(),
                    ],
                });
            }
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSendRecommendation = () => {
        if (selectedMedia && selectedFriend) {
            recommendationMutation.mutate({
                toUserId: selectedFriend.user_id,
                mediaId: selectedMedia.media_id,
            });
        }
    };

    const title = recipient
        ? `Рекомендовать для ${recipient.user_name}`
        : media
        ? `Рекомендовать "${media.name}"`
        : "Новая рекомендация";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {!media && (
                        <div>
                            <DialogDescription>
                                1. Найдите и выберите медиа
                            </DialogDescription>
                            <Input
                                placeholder="Название фильма, книги..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-2"
                            />
                            <ScrollArea className="h-40 w-full rounded-md border mt-2">
                                <div className="p-2 bg-background">
                                    {isSearching && (
                                        <p className="p-2">Поиск...</p>
                                    )}
                                    {searchResults?.map((item) => (
                                        <div
                                            key={item.media_id}
                                            className={`p-2 rounded cursor-pointer hover:bg-accent ${
                                                selectedMedia?.media_id ===
                                                item.media_id
                                                    ? "bg-accent font-semibold"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedMedia(item)
                                            }
                                        >
                                            {item.name} ({item.year})
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {!recipient && (
                        <div>
                            <DialogDescription>
                                Выберите друга
                            </DialogDescription>
                            <ScrollArea className="h-40 w-full rounded-md border mt-2">
                                <div className="p-2 bg-background">
                                    {isLoadingFriends && (
                                        <p className="p-2">
                                            Загрузка друзей...
                                        </p>
                                    )}
                                    {friends?.map((friend) => (
                                        <div
                                            key={friend.user_id}
                                            className={`p-2 rounded cursor-pointer hover:bg-accent ${
                                                selectedFriend?.user_id ===
                                                friend.user_id
                                                    ? "bg-accent font-semibold"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedFriend(friend)
                                            }
                                        >
                                            {friend.user_name}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSendRecommendation}
                        disabled={
                            !selectedMedia ||
                            !selectedFriend ||
                            recommendationMutation.isPending
                        }
                    >
                        {recommendationMutation.isPending
                            ? "Отправка..."
                            : "Отправить"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
