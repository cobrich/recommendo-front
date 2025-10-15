import { updateCurrentUser } from "@/api/userApi";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

const EditProfileSchema = z.object({
    user_name: z
        .string()
        .min(2, { message: "The name must contain more than 3 symbols." }),
});
interface EditProfileDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function EditProfileDialog({
    isOpen,
    onOpenChange,
}: EditProfileDialogProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

    const form = useForm<z.infer<typeof EditProfileSchema>>({
        resolver: zodResolver(EditProfileSchema),
        defaultValues: {
            user_name: user?.user_name || "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({ user_name: user?.user_name || "" });
        }
    }, [isOpen, user, form]);

    const updateMutation = useMutation({
        mutationFn: updateCurrentUser,
        onSuccess: () => {
            toast.success("Profile successfully updated!");
            queryClient.invalidateQueries({
                queryKey: ["userProfile", user?.user_id.toString()],
            });
            queryClient.invalidateQueries({ queryKey: ["myFollowings"] });

            onOpenChange(false);
        },

        onError: (error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (values: z.infer<typeof EditProfileSchema>) => {
        updateMutation.mutate(values.user_name);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Редактировать профиль</DialogTitle>
                        <DialogDescription>
                            Внесите изменения в ваш профиль.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8 py-4"
                        >
                            <FormField
                                control={form.control}
                                name="user_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Имя пользователя</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ваше имя"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="p-0 h-auto"
                                    onClick={() => setChangePasswordOpen(true)}
                                >
                                    Change Password
                                </Button>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending
                                        ? "Сохранение..."
                                        : "Сохранить изменения"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <ChangePasswordDialog
                isOpen={isChangePasswordOpen}
                onOpenChange={setChangePasswordOpen}
            />
        </>
    );
}
