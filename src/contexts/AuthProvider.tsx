import { useState, useEffect, useCallback } from "react";
import { type User } from "@/types/index";
import { type TokenResponse } from "@/types/index";
import apiClient from "@/api";
import { useNavigate } from "react-router-dom";
import { LoginSchema, RegisterSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { type ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("authToken")
    );
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCurrentUser = useCallback(async (currentToken: string) => {
        try {
            // Устанавливаем токен для этого конкретного запроса
            const response = await apiClient.get<User>("/me", {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            setUser(response.data);
        } catch (error) {
            console.error(
                "Не удалось получить данные пользователя, токен невалиден",
                error
            );
            // Если токен невалиден, очищаем все
            localStorage.removeItem("authToken");
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchCurrentUser(token);
        } else {
            setIsLoading(false);
        }
    }, [token, fetchCurrentUser]);

    const login = async (data: z.infer<typeof LoginSchema>) => {
        const response = await apiClient.post<TokenResponse>("/login", data);
        const newToken = response.data.token;
        localStorage.setItem("authToken", newToken);
        setToken(newToken);
        await fetchCurrentUser(newToken); // Сразу получаем данные пользователя
        navigate("/");
    };

    const register = async (data: z.infer<typeof RegisterSchema>) => {
        await apiClient.post<User>("/register", data);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    const refetchUser = () => {
        if (token) fetchCurrentUser(token);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refetchUser,
            }}
        >
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
