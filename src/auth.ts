import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { jwtDecode } from "jwt-decode";
import API from "./lib/axios";

async function refreshAccessToken(token) {
  console.log("Refreshing access token", token);
  try {
    console.log("Beaarer token", `Bearer ${token.refreshToken}`);

    const response = await API.post("/refresh", {});

    console.log(response);

    const tokens = await response.data();

    console.log(tokens);

    if (response.statusText !== "OK" || response.status !== 200) {
      throw tokens;
    }

    /*const refreshedTokens = {
        "access_token": "acess-token",
        "expires_in": 2,
        "refresh_token": "refresh-token"
      }*/

    //return token;

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },

  callbacks: {
    jwt: async ({ token, account, user }) => {
      // user is only available the first time a user signs in authorized
      console.log(`In jwt callback - Token is ${JSON.stringify(token)}`);

      if (token.accessToken) {
        const decodedToken = jwtDecode(token.accessToken);
        console.log(decodedToken);
        token.accessTokenExpires = decodedToken?.exp * 1000;
      }

      if (account && user) {
        console.log(`In jwt callback - User is ${JSON.stringify(user)}`);
        console.log(`In jwt callback - account is ${JSON.stringify(account)}`);

        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      console.log(
        "**** Access token expires on *****",
        token.accessTokenExpires,
        new Date(token.accessTokenExpires)
      );
      if (Date.now() < token.accessTokenExpires) {
        console.log("**** returning previous token ******");
        return token;
      }

      // Access token has expired, try to update it
      console.log("**** Update Refresh token ******");
      //return token;
      return refreshAccessToken(token);
    },

    session: async ({ session, token }) => {
      console.log(`In session callback - Token is ${JSON.stringify(token)}`);
      if (token) {
        session.accessToken = token.accessToken;
        session.user = token.user;
      }
      return session;
    },
  },
});
