/* eslint-disable @typescript-eslint/no-explicit-any */
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginSchema } from "./schema";
import bcryptjs from "bcryptjs";
import { getCurrentUserByEmail } from "./actions/user";
import { ZodError } from "zod";
import { IUser } from "./model/UserModel";

class CustomError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
    this.message = code;
    this.stack = undefined;
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        let user: IUser | null = null;
        let password: string = "";

        try {
          const validateField = LoginSchema.safeParse(credentials);

          if (validateField.success) {
            const { email, password: parsedPassword } = validateField.data;
            password = parsedPassword;

            user = await getCurrentUserByEmail(email);
          }
        } catch (error: any) {
          if (error instanceof ZodError) {
            throw new CustomError("Invalid schema");
          }
          throw new CustomError(error.message);
        }

        if (!user || !user.password) {
          throw new CustomError("Invalid credentials");
        }

        const passwordMatch = await bcryptjs.compare(password, user.password);

        if (!passwordMatch) {
          throw new CustomError("Invalid credentials");
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
