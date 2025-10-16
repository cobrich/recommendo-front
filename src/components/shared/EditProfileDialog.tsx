import { updateCurrentUser, uploadAvatar } from "@/api/userApi";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
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
import { DeleteAccountSection } from "./DeleteAccountSection";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
    const { user, refetchUser } = useAuth();
    const queryClient = useQueryClient();
    const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const avatarMutation = useMutation({
        mutationFn: uploadAvatar,
        onSuccess: () => {
            toast.success("Аватар успешно обновлен!");
            refetchUser();
            queryClient.invalidateQueries({
                queryKey: ["userProfile", user?.user_id.toString()],
            });
            queryClient.invalidateQueries({ queryKey: ["myProfileData"] }); // Специальный ключ для AuthContext
        },
        onError: (error) => toast.error(`Ошибка загрузки: ${error.message}`),
    });

    const onSubmit = (values: z.infer<typeof EditProfileSchema>) => {
        updateMutation.mutate(values.user_name);
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            avatarMutation.mutate(file);
        }
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
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Avatar
                            className="h-24 w-24 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <AvatarImage
                                src={`http://localhost:8080${user?.avatar_url}`}
                                alt={user?.user_name}
                            />
                            <AvatarFallback>
                                {user?.user_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/png, image/jpeg"
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarMutation.isPending}
                        >
                            {avatarMutation.isPending
                                ? "Загрузка..."
                                : "Сменить аватар"}
                        </Button>
                    </div>
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
                    <div className="border-t border-border pt-4 mt-4">
                        <DeleteAccountSection />
                    </div>
                </DialogContent>
            </Dialog>
            <ChangePasswordDialog
                isOpen={isChangePasswordOpen}
                onOpenChange={setChangePasswordOpen}
            />
        </>
    );
}
