import { createContext } from "react";
import { type User } from "@/types";
import { LoginSchema, RegisterSchema } from "@/lib/zodSchemas";
import { z } from "zod";

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: z.infer<typeof LoginSchema>) => Promise<void>;
    register: (data: z.infer<typeof RegisterSchema>) => Promise<void>;
    logout: () => void;
    refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);
