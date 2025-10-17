import apiClient from ".";
import { type AIFindResult } from "@/types";

export const findMediaWithAI = async (description: string) => {
    // Указываем новый тип ответа
    const { data } = await apiClient.post<AIFindResult[]>("/ai/find-media", {
        description,
    });
    return data;
};