import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface JoinButtonProps {
  size?: "default" | "lg";
  className?: string;
}

const JoinButton: React.FC<JoinButtonProps> = ({
  size = "default",
  className = "",
}) => {
  return (
    <Button
      size={size}
      className={`bg-chatters-primary hover:bg-chatters-secondary text-white transition-all duration-300 
      ${size === "lg" ? "text-lg py-6 px-8 rounded-xl" : ""} 
      ${className}`}
    >
      <LogIn className="mr-2 h-5 w-5" /> Join Chatters
    </Button>
  );
};

export default JoinButton;
