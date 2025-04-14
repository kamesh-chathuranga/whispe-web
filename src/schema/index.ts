import * as z from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .trim()
    .regex(/^[^\d]+$/, { message: "Name should not be a number" }),
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters long" })
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z.string().min(1, { message: "Password is required" }).trim(),
});
