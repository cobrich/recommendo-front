import { AuthProvider } from "./contexts/AuthProvider";
import { ModalProvider } from "./contexts/ModalProvider";
import { AppRouter } from "./router";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";

function App() {
    return (
        // Оборачиваем все в BrowserRouter
        <BrowserRouter>
            <AuthProvider>
                <ModalProvider>
                    <AppRouter />
                </ModalProvider>
                <Toaster />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
