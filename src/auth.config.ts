import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import setCookieParser from "set-cookie-parser";
import API from "./lib/axios";
import { cookies } from "next/headers";

type sameSite = true | false | "lax" | "strict" | "none" | undefined;

class CustomError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
    this.message = code;
    this.stack = undefined;
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        try {
          const response = await API.post(
            "/auth/login",
            { email: credentials.email, password: credentials.password },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.statusText !== "OK" || response.status !== 200) {
            return null;
          }

          const parsedResponse = await response.data;

          const cookieStore = await cookies();
          const cookieCollection = setCookieParser(
            response.headers["set-cookie"]!
          );
          cookieCollection.forEach((cookie) =>
            cookieStore.set(cookie.name, cookie.value, {
              ...cookie,
              sameSite: cookie.sameSite as sameSite,
            })
          );

          const accessToken = cookieStore.get("access_token")?.value;
          const refreshToken = cookieStore.get("refresh_token")?.value;

          return {
            accessToken,
            refreshToken,
            email: parsedResponse.email,
            name: parsedResponse.name,
            id: parsedResponse.id,
          };
        } catch {
          return null;
        }
      },
    }),
    // GoogleProvider({
    //     clientId: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //     authorization: {
    //         params: {
    //             prompt: "consent",
    //             access_type: "offline",
    //             response_type: "code",
    //         },a
    //     },
    // }),
  ],
} satisfies NextAuthConfig;
