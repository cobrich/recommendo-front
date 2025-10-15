// src/api/recommendationApi.ts
import apiClient from ".";
import { type MediaItem, type RecommendationDetails } from "@/types";

/**
 * Ищет медиа по названию и/или типу.
 * @param name - Часть названия для поиска.
 * @param type - Тип медиа (film, book, etc.).
 */
export const searchMedia = async (name: string, type: string = "") => {
  // Используем URLSearchParams для удобного формирования query-параметров
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (type) params.append("type", type);
  
  const { data } = await apiClient.get<MediaItem[]>(`/media?${params.toString()}`);
  return data;
};

/**
 * Создает новую рекомендацию.
 * @param toUserId - ID пользователя, которому рекомендуют.
 * @param mediaId - ID медиа-объекта.
 */
export const createRecommendation = async ({ toUserId, mediaId }: { toUserId: number; mediaId: number }) => {
  const { data } = await apiClient.post('/recommendations', {
    to_user_id: toUserId,
    media_id: mediaId,
  });
  return data;
};

/**
 * Получает рекомендации для пользователя.
 * @param userId - ID пользователя.
 * @param direction - 'sent' (отправленные) или 'received' (полученные, по умолчанию).
 */
export const getRecommendations = async (userId: string, direction: 'sent' | 'received' = 'received') => {
  const { data } = await apiClient.get<RecommendationDetails[]>(`/users/${userId}/recommendations?direction=${direction}`);
  return data;
};

/**
 * Удаляет рекомендацию по её ID.
 * @param recommendationId - ID рекомендации, которую нужно удалить.
 */
export const deleteRecommendation = async (recommendationId: number) => {
  // Бэкенд вернет 204 No Content, поэтому ответа не ждем
  await apiClient.delete(`/me/recommendations/${recommendationId}`);
};