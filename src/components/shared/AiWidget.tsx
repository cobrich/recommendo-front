import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { findMediaWithAI } from "@/api/aiApi";
import { Bot, Loader2, PlusCircle, CheckCircle } from "lucide-react";
import { type AIFindResult, type MediaGuess } from "@/types";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { createMedia } from "@/api/mediaApi";

export function AiWidget() {
    const [prompt, setPrompt] = useState("");
    const [results, setResults] = useState<AIFindResult[]>([]);
    const queryClient = useQueryClient();

    const addMediaMutation = useMutation({
        mutationFn: createMedia,
        onSuccess: (newMedia) => {
            toast.success(`"${newMedia.name}" успешно добавлен в базу!`);
            // Обновляем список "Топ медиа", чтобы он мог там появиться
            queryClient.invalidateQueries({ queryKey: ["topMedia"] });
            // Обновляем результаты поиска ИИ, чтобы кнопка "Добавить" сменилась на "В базе"
            queryClient.invalidateQueries({ queryKey: ["aiFindResults"] }); // Используем новый ключ
        },
        onError: (error) =>
            toast.error(`Не удалось добавить: ${error.message}`),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            setResults([]);
            aiMutation.mutate(prompt);
        }
    };

    const handleAddMedia = (guess: MediaGuess) => {
        addMediaMutation.mutate({
            name: guess.name,
            year: guess.year,
            author: guess.author,
            tags: [guess.type], // Пока берем только один тип от ИИ
        });
    };

    // Обновляем useQuery для aiMutation
    const aiMutation = useMutation({
        mutationFn: findMediaWithAI,
        onSuccess: (data) => {
            setResults(data);
            // Устанавливаем данные в кэш с новым ключом
            queryClient.setQueryData(["aiFindResults"], data);
        },
        onError: (error) => {
            console.error(error);
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    ИИ-помощник
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="Опишите фильм, который ищете..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={aiMutation.isPending}
                    >
                        {aiMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Найти
                    </Button>
                </form>

                {results.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h4 className="font-semibold">Я думаю, вы ищете:</h4>
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="p-3 border rounded-lg bg-muted/50 flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-bold">
                                        {result.guess.name} ({result.guess.year}
                                        )
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {result.guess.reason}
                                    </p>
                                </div>

                                {result.is_in_database ? (
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/media/${result.media_id}`}>
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                            В базе
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            handleAddMedia(result.guess)
                                        }
                                        disabled={addMediaMutation.isPending}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Добавить
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
