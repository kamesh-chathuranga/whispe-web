import React from "react";
import { Message } from "@/types/types";
import { Check, CheckCheck, CircleAlert, Clock } from "lucide-react";

interface MessageStatusProps {
  status: Message["status"];
}

const MessageStatus = ({ status }: MessageStatusProps) => {
  switch (status) {
    case "sent":
      return <Check size={12} className="text-gray-500" />;
    case "delivered":
      return <CheckCheck size={12} className="text-gray-500" />;
    case "read":
      return <CheckCheck size={12} className=" text-blue-500" />;
    case "failed":
      return <CircleAlert size={12} className="text-gray-500" />;
    default:
      return <Clock size={12} className="text-gray-500" />;
  }
};

export default MessageStatus;
