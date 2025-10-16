import { useQuery } from "@tanstack/react-query";
import { getNewestUsers, getTopRecommenders } from "@/api/userApi";
import { UserList } from "@/components/shared/UserList";

export default function CommunityPage() {
    const { data: newestUsers, isLoading: isLoadingNewest } = useQuery({
        queryKey: ["newestUsers"],
        queryFn: getNewestUsers,
    });

    const { data: topRecommenders, isLoading: isLoadingTop } = useQuery({
        queryKey: ["topRecommenders"],
        queryFn: getTopRecommenders,
    });

    return (
        <div className="space-y-12">
            <section>
                <h1 className="text-3xl font-bold mb-6">Сообщество</h1>
                <p className="text-muted-foreground">
                    Знакомьтесь с новыми участниками и находите самых активных
                    экспертов.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">
                    Новые в сообществе
                </h2>
                <UserList
                    users={newestUsers}
                    isLoading={isLoadingNewest}
                    error={null} // Можно добавить обработку ошибок
                    emptyMessage="Пока нет новых пользователей."
                />
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">
                    Топ рекомендателей
                </h2>
                <UserList
                    users={topRecommenders}
                    isLoading={isLoadingTop}
                    error={null}
                    emptyMessage="Пока никто не отправлял рекомендаций."
                />
            </section>
        </div>
    );
}
