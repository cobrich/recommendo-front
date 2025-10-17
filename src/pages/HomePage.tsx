import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { SuggestedUsers } from "@/components/shared/SuggestedUsers";
import { CenterContent } from "@/components/shared/CenterContent";
import { AiWidget } from "@/components/shared/AiWidget";

export default function HomePage() {
    return (
        // Создаем трехколоночный макет, который на мобильных устройствах складывается в одну колонку
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Левая колонка (видна на больших экранах) */}
            <aside className="hidden lg:block lg:col-span-3">
                <AiWidget />
            </aside>

            {/* Центральная колонка */}
            <main className="lg:col-span-6">
                <CenterContent />
            </main>

            {/* Правая колонка */}
            <aside className="lg:col-span-3 space-y-8">
                <SuggestedUsers />
                <div>
                    <h3 className="font-semibold mb-4">Лента активности</h3>
                    <ActivityFeed />
                </div>
            </aside>
        </div>
    );
}
