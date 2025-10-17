import apiClient from ".";
import { type MediaGuess } from "@/types";

export const findMediaWithAI = async (description: string) => {
    const { data } = await apiClient.post<MediaGuess[]>("/ai/find-media", {
        description,
    });
    return data;
};
