"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface FriendRequestCardProps {
  id: string;
  name: string;
  imageUrl: string | undefined;
  onAccept: (requestId: string) => void;
  onDelete: (requestId: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  id,
  name,
  imageUrl,
  onAccept,
  onDelete,
}) => {
  return (
    <Card className="w-80 shadow-md rounded-lg h-fit">
      <CardHeader className="flex flex-row gap-4 items-center p-4 ">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={imageUrl || "/sample.jpg"}
            alt={name}
            className="object-cover"
          />
        </Avatar>
        <div>
          <h3 className="text-sm font-semibold">{name}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onAccept(id)}
          >
            Confirm
          </Button>
          <Button
            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={() => onDelete(id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendRequestCard;
