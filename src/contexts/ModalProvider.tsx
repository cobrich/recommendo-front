import { useState, type ReactNode } from "react";
import { EditProfileDialog } from "@/components/shared/EditProfileDialog";
import { RecommendationDialog } from "@/components/shared/RecommendationDialog";
import {
    ModalContext,
    type ModalPayload,
    type ModalType,
} from "./ModalContext";

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modalState, setModalState] = useState<{
        type: ModalType | null;
        payload: ModalPayload | null;
    }>({ type: null, payload: null });

    const openModal = (type: ModalType, payload: ModalPayload = {}) => {
        setModalState({ type, payload });
    };

    const closeModal = () => {
        setModalState({ type: null, payload: null });
    };

    return (
        <ModalContext.Provider value={{ openModal }}>
            {children}

            {/* Здесь рендерятся все модальные окна приложения */}
            <EditProfileDialog
                isOpen={modalState.type === "editProfile"}
                onOpenChange={closeModal}
            />

            <RecommendationDialog
                isOpen={modalState.type === "recommendation"}
                onOpenChange={closeModal}
                recipient={modalState.payload?.user}
                media={modalState.payload?.media}
            />
        </ModalContext.Provider>
    );
};
