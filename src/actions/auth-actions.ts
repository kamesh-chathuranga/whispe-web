"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { LoginSchema } from "@/schema";
import { RegisterSchema } from "@/schema";
import { DEFAULT_LOGIN_REDIRECT, DEFAULT_SIGNOUT_REDIRECT } from "@/routes";
import API from "@/lib/axios";
import { cookies } from "next/headers";

export const loginAction = async (formdata: z.infer<typeof LoginSchema>) => {
  try {
    const { email, password } = formdata;

    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            status: 401,
            success: false,
            message: "Invalid credentials",
          };
        default:
          return {
            status: 500,
            success: false,
            message: "Failed to login user",
          };
      }
    }

    throw error;
  }
};

export const registerAction = async (
  formdata: z.infer<typeof RegisterSchema>
) => {
  try {
    const response = await API.post("/auth/register", formdata);

    return {
      status: response.status,
      success: true,
      message: response.data,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: 500,
        success: false,
        message: "An error occurred while creating the user",
      };
    }
    throw error;
  }
};

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const cookieCollection = cookieStore.getAll();
    const cookieStr = cookieCollection
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    await API.post("/auth/logout", {}, { headers: { cookie: cookieStr } });

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    await signOut({ redirectTo: DEFAULT_SIGNOUT_REDIRECT });
  } catch (error) {
    throw error;
  }
}

// "use server";

// import * as z from "zod";
// import { LoginSchema } from "@/schema";
// import { RegisterSchema } from "@/schema";
// import setCookieParser from "set-cookie-parser";
// import API from "@/lib/axios";
// import { cookies } from "next/headers";
// import { AxiosError } from "axios";
// import { LoginActionResponse, BaseResponse } from "@/types/types";

// type sameSite = true | false | "lax" | "strict" | "none" | undefined;

// export async function loginAction(
//   formdata: z.infer<typeof LoginSchema>
// ): Promise<LoginActionResponse> {
//   try {
//     const response = await API.post("/auth/login", formdata);

//     const cookieStore = await cookies();
//     const cookieCollection = setCookieParser(response.headers["set-cookie"]!);
//     cookieCollection.forEach((cookie) =>
//       cookieStore.set(cookie.name, cookie.value, {
//         ...cookie,
//         sameSite: cookie.sameSite as sameSite,
//       })
//     );

//     return {
//       data: response.data,
//       status: response.status,
//       message: "Login Success",
//     };
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       return {
//         data: null,
//         status: error.response?.status,
//         message: error.response?.data.message,
//       };
//     }

//     return {
//       data: null,
//       message: "Something went wrong, please try again later.",
//       status: 500,
//     };
//   }
// }

// export async function registerUser(
//   formdata: z.infer<typeof RegisterSchema>
// ): Promise<BaseResponse> {
//   try {
//     const response = await API.post("/auth/register", formdata);
//     return {
//       message: response.data.message,
//       status: response.status,
//     };
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       return {
//         status: error.response?.status,
//         message: error.response?.data.message,
//       };
//     }

//     return {
//       message: "Something went wrong, please try again later.",
//       status: 500,
//     };
//   }
// }

// export async function logoutAction(): Promise<BaseResponse> {
//   try {
//     const cookieStore = await cookies();
//     const cookieCollection = cookieStore.getAll();
//     const cookieStr = cookieCollection
//       .map((cookie) => `${cookie.name}=${cookie.value}`)
//       .join("; ");

//     const response = await API.post(
//       "/auth/logout",
//       {},
//       { headers: { cookie: cookieStr } }
//     );

//     cookieStore.delete("access_token");
//     cookieStore.delete("refresh_token");

//     return { message: response.data.message, status: response.status };
//   } catch (error) {
//     if (error instanceof AxiosError) {
//       return {
//         status: error.response?.status,
//         message: error.response?.data.message,
//       };
//     }

//     return {
//       message: "Something went wrong, please try again later.",
//       status: 500,
//     };
//   }
// }
