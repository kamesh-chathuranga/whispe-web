import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl bg-white bg-opacity-80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      <div className="mb-4 text-chatters-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-chatters-dark">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
