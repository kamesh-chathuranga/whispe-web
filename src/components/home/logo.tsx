import React from "react";
import { MessageCircle } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div
      className={`flex items-center gap-2 font-bold ${sizes[size]} ${className}`}
    >
      <MessageCircle
        className={`text-chatters-primary ${
          size === "lg" ? "h-10 w-10" : size === "md" ? "h-7 w-7" : "h-5 w-5"
        }`}
      />
      <span>Whispe</span>
    </div>
  );
};

export default Logo;
