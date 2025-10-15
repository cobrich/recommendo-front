// src/components/shared/RecommendationDialog.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Добавьте этот импорт
import { toast } from "sonner";
import { createRecommendation, searchMedia } from "@/api/recommendationApi";
import { type MediaItem, type User } from "@/types";
import { useDebounce } from "../../hooks/useDebounce"; // Добавьте этот импорт

interface RecommendationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recipient: User; // Пользователь, которому мы отправляем рекомендацию
}

export function RecommendationDialog({ isOpen, onOpenChange, recipient }: RecommendationDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const queryClient = useQueryClient();

  // Используем debounce, чтобы не отправлять запрос на каждое нажатие клавиши
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query для поиска медиа
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['mediaSearch', debouncedSearchTerm],
    queryFn: () => searchMedia(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 2, // Начинаем поиск только когда введено 3+ символа
  });

  console.log("Результаты поиска:", searchResults);

  // Mutation для создания рекомендации
  const recommendationMutation = useMutation({
    mutationFn: createRecommendation,
    onSuccess: () => {
      toast.success(`Рекомендация для ${recipient.user_name} успешно отправлена!`);
      queryClient.invalidateQueries({ queryKey: ['recommendations', recipient.user_id.toString()] });
      onOpenChange(false); // Закрываем окно
      setSearchTerm("");
      setSelectedMedia(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSendRecommendation = () => {
    if (selectedMedia) {
      recommendationMutation.mutate({ toUserId: recipient.user_id, mediaId: selectedMedia.media_id });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Рекомендовать для {recipient.user_name}</DialogTitle>
          <DialogDescription>Найдите фильм, книгу или игру, чтобы порекомендовать.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Название медиа..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-48 w-full rounded-md border">
          <div className="p-4 bg-background">
              {isSearching && <p>Поиск...</p>}
              {!isSearching && searchResults?.map(item => (
                <div
                  key={item.media_id}
                  className={`p-2 rounded cursor-pointer hover:bg-accent ${selectedMedia?.media_id === item.media_id ? 'bg-accent' : ''}`}
                  onClick={() => setSelectedMedia(item)}
                >
                  <p className="font-semibold">{item.name} ({item.year})</p>
                  <p className="text-sm text-muted-foreground">{item.author} - {item.item_type}</p>
                </div>
              ))}
              {!isSearching && debouncedSearchTerm.length > 2 && searchResults?.length === 0 && (
                <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSendRecommendation}
            disabled={!selectedMedia || recommendationMutation.isPending}
          >
            {recommendationMutation.isPending ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}