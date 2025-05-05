import { Check, CheckCheck } from "lucide-react";
import React, { Fragment } from "react";

interface MessageStatusProps {
  status: string;
}

const MessageStatus = ({ status }: MessageStatusProps) => {
  return (
    <Fragment>
      {status === "sent" && <Check size={12} className="text-gray-500" />}
      {status === "delivered" && (
        <CheckCheck size={12} className="text-gray-500" />
      )}
      {status === "read" && <CheckCheck size={12} className=" text-blue-500" />}
    </Fragment>
  );
};

export default MessageStatus;
