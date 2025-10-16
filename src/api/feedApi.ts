import apiClient from ".";
import { type FeedItem } from "@/types";

export const getFeed = async () => {
    const { data } = await apiClient.get<FeedItem[]>("/feed");
    return data;
};
