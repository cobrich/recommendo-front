import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Неверный формат email." }),
  password: z.string().min(1, { message: "Пароль не может быть пустым." }),
});

export const RegisterSchema = z.object({
  user_name: z.string().min(2, { message: "Имя пользователя должно быть не менее 2 символов." }),
  email: z.string().email({ message: "Неверный формат email." }),
  password: z.string().min(8, { message: "Пароль должен быть не менее 8 символов." }),
});