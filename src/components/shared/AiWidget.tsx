import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { findMediaWithAI } from "@/api/aiApi";
import { Bot, Loader2 } from "lucide-react";
import { type MediaGuess } from "@/types";

export function AiWidget() {
    const [prompt, setPrompt] = useState("");
    const [results, setResults] = useState<MediaGuess[]>([]);

    const aiMutation = useMutation({
        mutationFn: findMediaWithAI,
        onSuccess: (data) => {
            setResults(data);
        },
        onError: (error) => {
            // Здесь можно добавить toast с ошибкой
            console.error(error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            setResults([]); // Очищаем старые результаты
            aiMutation.mutate(prompt);
        }
    };

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
                        placeholder="Опишите фильм, который ищете... Например, 'фильм про парня, который узнал, что живет в симуляции'"
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
                        {results.map((guess, index) => (
                            <div
                                key={index}
                                className="p-3 border rounded-lg bg-muted/50"
                            >
                                <p className="font-bold">
                                    {guess.name} ({guess.year})
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {guess.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
