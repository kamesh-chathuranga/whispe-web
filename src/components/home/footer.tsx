import React from "react";
import Logo from "./logo";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("bg-white py-10 px-6 border-t", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <Logo size="md" className="mb-4 md:mb-0" />

          <div className="flex gap-8">
            <a
              href="#"
              className="text-gray-600 hover:text-chatters-primary transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-chatters-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-chatters-primary transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-chatters-primary transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center md:text-left text-gray-500 text-sm">
          © {new Date().getFullYear()} Whispe. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
