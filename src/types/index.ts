// src/types/index.ts

// На основе dtos/userResponseDTO.go и models/user.go
// Важно использовать json теги (`user_id`), а не имена полей Go (`ID`)
export interface User {
    user_id: number;
    user_name: string;
    email: string;
    created_at: string;
    avatar_url?: string;
}

// На основе dtos/paginatedResponseDTO.go
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

// На основе dtos/tokenResponseDTO.go
export interface TokenResponse {
    token: string;
}

// На основе models/media_item.go
export type MediaType = "film" | "anime" | "book" | "game" | "series";

export interface MediaItem {
    media_id: number;
    item_type: MediaType;
    name: string;
    year: number;
    author: string;
    created_at: string;
    recommendation_count: number;
    external_link?: string;
    avg_rating: number;
    rating_count: number;
    comment_count: number;
}

// На основе models/recommendation_details.go
export interface RecommendationDetails {
    recommendation_id: number;
    media: MediaItem;
    user: {
        // Упрощенный User из JOIN
        user_id: number;
        user_name: string;
        created_at: string;
    };
    created_at: string;
}

export interface PasswordValidationError {
    length: boolean;
    has_upper: boolean;
    has_lower: boolean;
    has_number: boolean;
    has_special: boolean;
}

// Детали для события "рекомендация"
export interface RecommendationEventDetails {
    recipient: { user_id: number; user_name: string };
    media: { media_id: number; name: string };
}

// Детали для события "подписка"
export interface FollowEventDetails {
    followed_user: { user_id: number; user_name: string };
}

// Универсальный элемент ленты
export interface FeedItem {
    type: "recommendation" | "follow";
    created_at: string;
    actor: User;
    details: RecommendationEventDetails | FollowEventDetails;
}

export interface AppComment {
    comment_id: number;
    content: string;
    created_at: string;
    user: User;
}