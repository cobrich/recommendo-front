// src/types/index.ts

// На основе dtos/userResponseDTO.go и models/user.go
// Важно использовать json теги (`user_id`), а не имена полей Go (`ID`)
export interface User {
    user_id: number;
    user_name: string;
    email: string;
    created_at: string; // ISO-строка с датой
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
  }
  
  // На основе models/recommendation_details.go
  export interface RecommendationDetails {
    recommendation_id: number;
    media: MediaItem;
    user: { // Упрощенный User из JOIN
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