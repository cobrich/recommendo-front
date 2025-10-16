import apiClient from ".";
import { type MediaItem } from "@/types";

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
