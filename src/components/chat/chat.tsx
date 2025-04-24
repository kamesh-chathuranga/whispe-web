'use client";';

import React, { useEffect } from "react";
import Link from "next/link";
import { type SingleChat } from "@/types/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/store";

const Chat = ({ _id, partner, lastMessage }: SingleChat) => {
  const pathName = usePathname();
  const { setCurrentChat } = useStore();

  useEffect(() => {
    if (pathName.includes(_id)) {
      setCurrentChat({ _id, partner, lastMessage });
    }
  }, [_id, lastMessage, partner, pathName, setCurrentChat]);

  return (
    <Link
      href={`/chat/${_id}`}
      className={cn(
        "w-full h-full p-3 mb-1.5 flex border border-gray-200/50 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 ease-in-out",
        pathName === `/chat/${_id}` && "bg-gray-100 border-gray-300"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center">
          <div className="size-11 rounded-full relative flex items-center justify-center overflow-hidden border">
            {partner.avatarUrl ? (
              <Image
                src={partner.avatarUrl}
                alt={`${partner.name}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <User />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{partner.name}</p>
            <p className="mt-1 text-sm text-gray-500">
              {lastMessage
                ? lastMessage.sender._id === partner._id
                  ? `From: ${lastMessage.content}`
                  : `You: ${lastMessage.content}`
                : "You are now connected"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Chat;
