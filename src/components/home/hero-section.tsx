import React from "react";
import Logo from "./logo";
import JoinButton from "./join-button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <div className={cn("relative overflow-hidden py-20 px-6", className)}>
      <div className="absolute inset-0 bg-hero-pattern"></div>

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-chatters-accent opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -left-24 w-64 h-64 bg-chatters-secondary opacity-20 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block animate-float mb-4">
            <Logo size="lg" className="text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connect, Chat, Collaborate
          </h1>

          <p className="text-xl md:text-2xl text-chatters-light mb-10 max-w-3xl mx-auto">
            Join thousands of people chatting in real-time with our modern and
            intuitive messaging platform
          </p>

          <div className="animate-pulse-light">
            <JoinButton size="lg" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl">
          <div className="aspect-[16/9] bg-gradient-to-br from-chatters-dark to-chatters-secondary p-6 flex items-center justify-center">
            <div className="text-center text-chatters-light opacity-80">
              <p className="text-sm md:text-base">Application Preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
