import { UserCardSkeleton } from "./UserCardSkeleton";

export function UserListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <UserCardSkeleton key={index} />
            ))}
        </div>
    );
}
