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
import {
    createRecommendation,
    searchMedia,
    getRecommendations,
} from "@/api/recommendationApi";
import { getMyFriends } from "@/api/userApi";
import { type MediaItem, type User } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";

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
    // Get current user
    const { user: currentUser } = useAuth();

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
        enabled: !media && debouncedSearchTerm.length > 2, // Search media, only if its don't given
    });

    const { data: friends, isLoading: isLoadingFriends } = useQuery({
        queryKey: ["myFriends"],
        queryFn: getMyFriends,
        enabled: isOpen && !recipient, // Load friends, if only if the reciever don't given
    });

    // List of the recommendations which is already sended
    const { data: sentRecommendations } = useQuery({
        queryKey: ["sentRecommendations"],
        queryFn: () =>
            getRecommendations(currentUser!.user_id.toString(), "sent"),
        enabled: !!currentUser && isOpen, // Request only when dialog is open
    });

    // --- Мутация ---
    const recommendationMutation = useMutation({
        mutationFn: createRecommendation,
        onSuccess: () => {
            toast.success(`Recommendation send successfully!`);
            if (selectedFriend) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "receivedRecommendations",
                        selectedFriend.user_id.toString(),
                    ],
                });
            }
            onOpenChange(false);
        },
        onError: (error: AxiosError) => {
            let errorMessage = "Failed send recommendation!";

            // AxiosError имеет свойство `response`, которое содержит данные ответа сервера
            if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = "You are already recommend it to this friend.";
                } else if (
                    typeof error.response.data === "string" &&
                    error.response.data
                ) {
                    // Если data - это строка (как в случае с 500 ошибкой)
                    errorMessage = error.response.data;
                }
            } else {
                // Если нет `error.response`, значит, проблема с сетью или что-то еще
                errorMessage = error.message;
            }

            toast.error(errorMessage);
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
        ? `Recommend for${recipient.user_name}`
        : media
        ? `Recommend "${media.name}"`
        : "Новая рекомендация";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
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
                                    {searchResults?.map((item) => {
                                        // --- ЛОГИКА ПРОВЕРКИ ---
                                        // Проверяем, было ли это медиа уже порекомендовано ВЫБРАННОМУ другу
                                        const isAlreadyRecommended =
                                            sentRecommendations?.some(
                                                (rec) =>
                                                    rec.media.media_id ===
                                                        item.media_id &&
                                                    rec.user.user_id ===
                                                        selectedFriend?.user_id
                                            );

                                        return (
                                            <div
                                                key={item.media_id}
                                                className={`p-2 rounded ${
                                                    isAlreadyRecommended
                                                        ? "opacity-50 cursor-not-allowed" // Стиль для неактивного
                                                        : "cursor-pointer hover:bg-accent" // Стиль для активного
                                                } ${
                                                    selectedMedia?.media_id ===
                                                    item.media_id
                                                        ? "bg-accent font-semibold"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    if (!isAlreadyRecommended) {
                                                        setSelectedMedia(item);
                                                    }
                                                }}
                                            >
                                                {item.name} ({item.year})
                                                {isAlreadyRecommended && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        (уже порекомендовано)
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
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
