import React from "react";
import Logo from "./logo";
import JoinButton from "./join-button";
import { cn } from "@/lib/utils";

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  return (
    <header
      className={cn(
        "py-4 px-6 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm",
        className
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-chatters-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-chatters-primary transition-colors"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-chatters-primary transition-colors"
          >
            Support
          </a>
        </nav>

        <JoinButton />
      </div>
    </header>
  );
};

export default NavBar;
