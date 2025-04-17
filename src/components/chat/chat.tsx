'use client";';

import React from "react";
import Link from "next/link";
import { type Chat } from "@/types/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";

const Chat = ({ id, avatarUrl, lastMessage, partnerName }: Chat) => {
  const pathName = usePathname();

  return (
    <Link
      href={`/chat/${id}`}
      className={cn(
        "w-full h-full p-3 mb-1.5 flex border border-gray-200/50 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 ease-in-out",
        pathName === `/chat/${id}` && "bg-gray-100 border-gray-300"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center">
          <div className="size-11 rounded-full relative flex items-center justify-center overflow-hidden border">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${partnerName}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <User />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{partnerName}</p>
            <p className="mt-1 text-sm text-gray-500">
              {lastMessage ? lastMessage : "You are now connected"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Chat;
