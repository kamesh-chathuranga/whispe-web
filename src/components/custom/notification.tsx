import React from "react";
import toast, { type Toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Link from "next/link";

interface MessageNotificationProps {
  t: Toast;
  senderName: string;
  image: string | undefined;
  message: string;
  url: string;
}

const Notification = ({
  t,
  url,
  image,
  message,
  senderName,
}: MessageNotificationProps) => {
  return (
    <div
      className={cn(
        "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
        {
          "animate-enter": t.visible,
          "animate-leave": !t.visible,
        }
      )}
    >
      <Link
        href={url}
        onClick={() => toast.dismiss(t.id)}
        className="w-full h-full flex"
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Avatar>
                <AvatarImage
                  referrerPolicy="no-referrer"
                  src={image}
                  alt={`${image} user profile`}
                />
                <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{senderName}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center
           text-lg font-medium"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default Notification;
