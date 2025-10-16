import apiClient from ".";
import { type AppComment, type MediaItem } from "@/types";

export const getTopMedia = async () => {
    const { data } = await apiClient.get<MediaItem[]>("/media/top");
    return data;
};

export const rateMedia = async ({
    mediaId,
    score,
}: {
    mediaId: number;
    score: number;
}) => {
    await apiClient.put(`/media/${mediaId}/rating`, { score });
};

export const getComments = async (mediaId: number) => {
    const { data } = await apiClient.get<AppComment[]>(
        `/media/${mediaId}/comments`
    ); // <-- Изменили тип
    return data;
};

export const postComment = async ({
    mediaId,
    content,
}: {
    mediaId: number;
    content: string;
}) => {
    const { data } = await apiClient.post<AppComment>(
        `/media/${mediaId}/comments`,
        { content }
    ); // <-- Изменили тип
    return data;
};
