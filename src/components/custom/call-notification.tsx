"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { PhoneIncoming, PhoneOff, User } from "lucide-react";
import { IncomingCall } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import useVideoCall from "@/hooks/use-video-call";

interface CallNotificationProps {
  incomingCall: IncomingCall | null;
}

const CallNotification = ({ incomingCall }: CallNotificationProps) => {
  const { joinVideoCall, handleHangUp } = useVideoCall();

  if (!incomingCall) return null;

  return (
    <AlertDialog open={incomingCall.isRinging}>
      <AlertDialogTitle />
      <AlertDialogDescription />
      <AlertDialogContent className="sm:max-w-[400px] flex flex-col items-center gap-4 text-center p-6">
        <Avatar className="w-12 h-12">
          <AvatarImage
            referrerPolicy="no-referrer"
            src={incomingCall.caller.avatarUrl ?? undefined}
            alt={`${incomingCall.caller.name}'s Avatar`}
          />
          <AvatarFallback>
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{incomingCall.caller.name}</h2>
        <p className="text-sm text-muted-foreground">Incoming call...</p>
        <div className="flex gap-4 mt-4">
          <Button
            variant="destructive"
            onClick={() =>
              handleHangUp({
                incomingCall: incomingCall ? incomingCall : undefined,
                isEmitiHangUp: true,
              })
            }
            className="flex items-center gap-2"
          >
            <PhoneOff size={20} />
            Hang Up
          </Button>
          <Button
            variant="default"
            onClick={() => joinVideoCall(incomingCall)}
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
