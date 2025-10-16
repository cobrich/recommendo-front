import apiClient from ".";
import { type PaginatedResponse, type User } from "@/types";
import z from "zod";
import { ChangePasswordSchema } from "@/lib/zodSchemas";

/**
 * Получает данные конкретного пользователя по ID.
 */
export const getUserById = async (userId: string) => {
    const { data } = await apiClient.get<User>(`/users/${userId}`);
    return data;
};

/**
 * Получает список подписчиков пользователя (тех, кто подписан на него).
 */
export const getFollowers = async (userId: string) => {
    // Ваш бэкенд возвращает PaginatedResponse, поэтому типизируем data.data
    const { data } = await apiClient.get<PaginatedResponse<User>>(
        `/users/${userId}/followers`
    );
    return data.data; // Возвращаем только массив пользователей
};

/**
 * Получает список подписок пользователя (тех, на кого он подписан).
 */
export const getFollowings = async (userId: string) => {
    const { data } = await apiClient.get<PaginatedResponse<User>>(
        `/users/${userId}/followings`
    );
    return data.data; // Возвращаем только массив пользователей
};

/**
 * Подписывает текущего пользователя на другого пользователя.
 * @param followingId - ID пользователя, на которого нужно подписаться.
 */
export const followUser = async (followingId: number) => {
    // Тело запроса соответствует вашему CreateFollowRequestDTO
    const { data } = await apiClient.post("/follows", {
        following_id: followingId,
    });
    return data;
};

/**
 * Отписывает текущего пользователя от другого пользователя.
 * @param targetUserId - ID пользователя, от которого нужно отписаться.
 */
export const unfollowUser = async (targetUserId: number) => {
    const { data } = await apiClient.delete(`/follows/${targetUserId}`);
    return data;
};

/**
 * Получает список ПОДПИСОК ТЕКУЩЕГО пользователя.
 * Это нужно, чтобы проверить, на кого он уже подписан.
 */
export const getMyFollowings = async () => {
    const { data } = await apiClient.get<PaginatedResponse<User>>(
        "/me/followings"
    );
    return data.data;
};

export const updateCurrentUser = async (newUserName: string) => {
    const { data } = await apiClient.patch<User>("/me", {
        user_name: newUserName,
    });
    return data;
};

export const changeCurrentUserPassword = async (
    passwords: z.infer<typeof ChangePasswordSchema>
) => {
    const requestBody = {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
    };
    await apiClient.put("/me/password", requestBody);
};

export const deleteCurrentUser = async () => {
    await apiClient.delete("/me");
}

export const getMyFriends = async () => {
    const { data } = await apiClient.get<PaginatedResponse<User>>(
        "/me/friends"
    );
    return data.data;
};

/**
 * Получает список друзей для указанного пользователя.
 * @param userId - ID пользователя, чьих друзей нужно получить.
 */
export const getFriends = async (userId: string) => {
  const { data } = await apiClient.get<PaginatedResponse<User>>(`/users/${userId}/friends`);
  return data.data;
};

export const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await apiClient.post<{ avatar_url: string }>(
        "/me/avatar",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return data;
};

export const deleteCurrentUserAvatar = async () => {
    await apiClient.delete("/me/avatar");
};

export const getNewestUsers = async () => {
    const { data } = await apiClient.get<User[]>("/users/newest");
    return data;
};

export const getTopRecommenders = async () => {
    const { data } = await apiClient.get<User[]>("/users/top-recommenders");
    return data;
};