import { Check, CheckCheck } from "lucide-react";
import React, { Fragment } from "react";

interface MessageStatusProps {
  status: string;
}

const MessageStatus = ({ status }: MessageStatusProps) => {
  return (
    <Fragment>
      {status === "sent" && <Check className="text-lg" />}
      {status === "delivered" && <Check className="text-lg" />}
      {status === "read" && <CheckCheck className="text-lg text-white" />}
    </Fragment>
  );
};

export default MessageStatus;
