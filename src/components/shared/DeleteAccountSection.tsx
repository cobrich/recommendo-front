import { useMutation } from "@tanstack/react-query";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { deleteCurrentUser } from "@/api/userApi";

export function DeleteAccountSection() {
    const { logout } = useAuth();

    const deleteMutation = useMutation({
        mutationFn: deleteCurrentUser,
        onSuccess: () => {
            toast.success("Your account deleted successfully!");
            logout();
        },
        onError: (error) => {
            toast.error(`Failed to delete account: ${error.message}`);
        },
    });

    return (
        <div className="pt-6">
            <h3 className="text-lg font-semibold text-destructive">
                Dangerous zone
            </h3>
            <div className="mt-2 p-4 border border-destructive/50 rounded-lg flex items-center justify-between">
                <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone! All your data will be
                        deleted!
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. Your account and
                                all associated data, including subscriptions and
                                recommendations, will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteMutation.mutate()}
                            >
                                Yes, delete account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
