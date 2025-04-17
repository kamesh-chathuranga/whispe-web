"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

interface ProfileCardProps {
  id: string;
  name: string;
  imageUrl: string | undefined;
  text: string;
  icon: React.ReactNode;
  onClick: (userId: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  imageUrl,
  text,
  icon,
  onClick,
}) => {
  return (
    <Card className="w-56 shadow-md rounded-lg overflow-hidden h-fit">
      {/* Full-width Image */}
      <div className="w-full h-28 relative">
        <Image
          src={imageUrl || "/sample.jpg"}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* User Name */}
      <CardContent className="px-3 py-2">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-3 pt-0">
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={() => onClick(id)}
        >
          {icon}
          {text}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
