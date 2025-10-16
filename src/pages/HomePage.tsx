import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { SuggestedUsers } from "@/components/shared/SuggestedUsers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CenterContent } from "@/components/shared/CenterContent";

// Временные заглушки для левой и центральной колонок
function LeftSidebar() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Виджет</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Здесь будет квиз или полезная информация.
                </p>
            </CardContent>
        </Card>
    );
}

export default function HomePage() {
    return (
        // Создаем трехколоночный макет, который на мобильных устройствах складывается в одну колонку
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Левая колонка (видна на больших экранах) */}
            <aside className="hidden lg:block lg:col-span-3">
                <LeftSidebar />
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
