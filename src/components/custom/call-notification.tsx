import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { PhoneIncoming, PhoneOff, User } from "lucide-react";
import { IncomingCall } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { Button } from "@/components/ui/button";

interface CallNotificationProps {
  incomingCall: IncomingCall | null;
  onClose: () => void;
}

const CallNotification = ({ incomingCall, onClose }: CallNotificationProps) => {
  if (!incomingCall) return null;

  return (
    <AlertDialog open={incomingCall.isRinging} onOpenChange={onClose}>
      <AlertDialogTitle />
      <AlertDialogContent className="sm:max-w-[400px] flex flex-col items-center gap-4 text-center p-6">
        <Avatar className="w-12 h-12">
          <AvatarImage
            referrerPolicy="no-referrer"
            src={incomingCall.callerAvatarUrl ?? undefined}
            alt={`${incomingCall.callerName}'s Avatar`}
          />
          <AvatarFallback>
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{incomingCall.callerName}</h2>
        <p className="text-sm text-muted-foreground">Incoming call...</p>
        <div className="flex gap-4 mt-4">
          <Button
            variant="destructive"
            onClick={() => {}}
            className="flex items-center gap-2"
          >
            <PhoneOff size={20} />
            Hang Up
          </Button>
          <Button
            variant="default"
            onClick={() => {}}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
          >
            <PhoneIncoming size={20} />
            Answer
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default CallNotification;
