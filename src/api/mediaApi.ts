import apiClient from ".";
import { type MediaItem } from "@/types";

export const getTopMedia = async () => {
    const { data } = await apiClient.get<MediaItem[]>("/media/top");
    return data;
};
