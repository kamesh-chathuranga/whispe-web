import React from "react";
import { signIn } from "next-auth/react";

import { Button } from "../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import GoogleIcon from "../ui/google-icon";

const SocialLogin = () => {
  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: DEFAULT_LOGIN_REDIRECT });
  };

  return (
    <div className="flex items-center w-full">
      <Button
        size="lg"
        className="w-full items-center justify-center flex"
        variant="outline"
        onClick={handleGoogleLogin}
      >
        <GoogleIcon className="size-20" />
        <span>Continue with Google</span>
      </Button>
    </div>
  );
};

export default SocialLogin;
