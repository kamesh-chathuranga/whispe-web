"use client";

import { useStore } from "@/store";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff } from "lucide-react";
import useMediaCall from "@/hooks/use-media-call";
import { formatCallDuration } from "@/lib/calculateTime";

const AudioCallPlayer = () => {
  const { peer, incomingCall, localStream, currentUser } = useStore();
  const { handleHangUp } = useMediaCall();
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Start timer when call connects
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (peer?.stream) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [peer?.stream]);

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleEndCall = () => {
    handleHangUp({
      incomingCall: incomingCall || undefined,
      isEmitiHangUp: true,
    });
  };

  //   if (!peer) return <p>No stream</p>;

  const partnerName =
    (incomingCall?.caller._id === currentUser?.id
      ? incomingCall?.receiver.name
      : incomingCall?.caller.name) || "Unknown Caller";

  const partnerAvatar =
    incomingCall?.caller._id === currentUser?.id
      ? incomingCall?.receiver.avatarUrl
      : incomingCall?.caller.avatarUrl;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto bg-background p-6 rounded-xl shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-1">{partnerName}</h2>
        <p className="text-muted-foreground">
          {peer?.stream ? formatCallDuration(callDuration) : "Connecting..."}
        </p>
      </div>

      <Avatar className="h-40 w-40 mb-8">
        {partnerAvatar ? (
          <AvatarImage src={partnerAvatar} alt={partnerName} />
        ) : (
          <AvatarFallback className="text-4xl">
            {partnerName.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex gap-6 mt-4">
        <Button
          onClick={toggleMute}
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          className="rounded-full h-14 w-14"
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </Button>

        <Button
          onClick={handleEndCall}
          variant="destructive"
          size="icon"
          className="rounded-full h-14 w-14"
        >
          <PhoneOff size={24} />
        </Button>
      </div>
    </div>
  );
};

export default AudioCallPlayer;
