"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinButtonProps {
  size?: "default" | "lg";
  className?: string;
}

const JoinButton: React.FC<JoinButtonProps> = ({
  size = "default",
  className = "",
}) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/chat")}
      size={size}
      className={`bg-green-500 hover:bg-chatters-secondary text-white transition-all duration-300 shadow-md
      ${size === "lg" ? "text-lg py-6 px-8 rounded-md" : ""} 
      ${className}`}
    >
      <LogIn className="mr-2 h-5 w-5" /> Join Whispe
    </Button>
  );
};

export default JoinButton;
