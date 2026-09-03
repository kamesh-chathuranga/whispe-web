import React from "react";
import FeatureCard from "./feature-card";
import { MessageSquare, Users, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  const features = [
    {
      icon: <MessageSquare size={36} />,
      title: "Real-time Messaging",
      description:
        "Instantly connect with friends and colleagues with fast, reliable messaging.",
    },
    {
      icon: <Users size={36} />,
      title: "Group Chats",
      description:
        "Create channels for teams, projects, or interests to collaborate efficiently.",
    },
    {
      icon: <Lock size={36} />,
      title: "Secure & Private",
      description:
        "End-to-end encryption ensures your conversations stay private.",
    },
    {
      icon: <Zap size={36} />,
      title: "Lightning Fast",
      description:
        "Optimized performance means no delays in your communications.",
    },
  ];

  return (
    <div className={cn("py-20 px-6 bg-chatters-light", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-chatters-dark">
            Why Choose Whispe?
          </h2>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            Our platform combines powerful features with an intuitive interface
            to make communication seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
