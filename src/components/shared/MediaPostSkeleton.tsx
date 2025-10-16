import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MediaPostSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </CardFooter>
        </Card>
    );
}
