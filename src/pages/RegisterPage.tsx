import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterSchema } from "@/lib/zodSchemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { user_name: "", email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    try {
      await register(values);
      toast.success("Регистрация прошла успешно! Теперь вы можете войти.");
      navigate("/login");
    } catch (error: any) {
      let errorMessage = "Произошла неизвестная ошибка. Попробуйте снова.";

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Случай 1: Ошибка - это простая строка (например, "user with this email already exists")
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } 
        // Случай 2: Ошибка - это объект валидации пароля
        else if (typeof errorData === 'object' && ('has_upper' in errorData || 'has_lower' in errorData)) {
            const validationErrors: string[] = [];
            if (errorData.length) validationErrors.push("пароль должен быть не менее 8 символов");
            if (errorData.has_upper) validationErrors.push("должен содержать заглавную букву");
            if (errorData.has_lower) validationErrors.push("должен содержать строчную букву");
            if (errorData.has_number) validationErrors.push("должен содержать цифру");
            if (errorData.has_special) validationErrors.push("должен содержать специальный символ (!@#...)");
            
            if (validationErrors.length > 0) {
                errorMessage = `Пароль не подходит: ${validationErrors.join(', ')}.`;
            }
        }
        // Случай 3: Другой тип объекта ошибки (на будущее)
        else if (errorData.error) {
            errorMessage = errorData.error;
        }
      }
      toast.error(errorMessage, {
        duration: 8000,
      });
    }
  };

  return (
    <div className="flex justify-center items-start pt-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт, чтобы начать пользоваться сервисом.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Создание..." : "Зарегистрироваться"}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="underline">Войти</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}