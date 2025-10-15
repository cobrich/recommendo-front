import { changeCurrentUserPassword } from "@/api/userApi";
import { ChangePasswordSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChangePasswordDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ChangePasswordDialog({
    isOpen,
    onOpenChange,
}: ChangePasswordDialogProps) {
    const form = useForm<z.infer<typeof ChangePasswordSchema>>({
        resolver: zodResolver(ChangePasswordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: changeCurrentUserPassword,
        onSuccess: () => {
            toast.success("Password changed successfully!");
            onOpenChange(false);
            form.reset();
        },
        onError: (error: unknown) => {
            if (error instanceof Error) {
                const errorData = error.message;
                let errorMessage = "Error occured! Please, try again.";

                if (typeof errorData === "string") {
                    errorMessage = errorData;
                } else if (
                    typeof errorData === "object" &&
                    errorData !== null
                ) {
                    const messages = Object.values(errorData)
                        .filter((val) => val)
                        .join(", ");
                    if (messages) {
                        errorMessage = `New password does not match: ${messages.replace(
                            /true/g,
                            ""
                        )}`;
                    }
                }
                toast.error(errorMessage);
            }
        },
    });

    const onSubmit = (values: z.infer<typeof ChangePasswordSchema>) => {
        changePasswordMutation.mutate(values);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Смена пароля</DialogTitle>
                    <DialogDescription>
                        Введите ваш текущий и новый пароль.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="current_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Текущий пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="new_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Новый пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirm_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Подтвердите новый пароль
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                            >
                                {changePasswordMutation.isPending
                                    ? "Сохранение..."
                                    : "Сменить пароль"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
