import { AuthProvider } from "./contexts/AuthProvider";
import { ModalProvider } from "./contexts/ModalProvider";
import { AppRouter } from "./router";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";

function App() {
    return (
        // Оборачиваем все в BrowserRouter
        <BrowserRouter>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <AuthProvider>
                    <ModalProvider>
                        <AppRouter />
                    </ModalProvider>
                    <Toaster />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
