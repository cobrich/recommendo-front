import { createContext } from "react";
import { type User, type MediaItem } from "@/types";

export type ModalType = "editProfile" | "recommendation";

export interface ModalPayload {
    user?: User;
    media?: MediaItem;
}

export interface ModalContextType {
    openModal: (type: ModalType, payload?: ModalPayload) => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(
    undefined
);
