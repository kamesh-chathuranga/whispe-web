/* eslint-disable @typescript-eslint/no-explicit-any */
import socket from "@/lib/socket";
import { useStore } from "@/store";
import { IncomingCall } from "@/types/types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Peer, { SignalData } from "simple-peer";

export type CallType = "video" | "audio";

const useMediaCall = () => {
  const {
    localStream,
    setLocalStream,
    currentUser,
    currentChat: chat,
    setIncomingCall,
    setPeer,
    setIsCallEnded,
  } = useStore();
  const router = useRouter();

  const handleHangUp = useCallback(
    (data: { incomingCall?: IncomingCall; isEmitiHangUp?: boolean }) => {
      if (socket && currentUser && data?.incomingCall && data.isEmitiHangUp) {
        socket.emit("call:hangup", {
          incomingCall: data.incomingCall,
          hangupUserId: currentUser.id,
        });
      }

      setIncomingCall(null);
      setPeer(null);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        setLocalStream(null);
      }
      setIsCallEnded(true);
    },
    [
      currentUser,
      localStream,
      setIncomingCall,
      setIsCallEnded,
      setLocalStream,
      setPeer,
    ]
  );

  const createPeerConnection = useCallback(
    (stream: MediaStream, initiator: boolean) => {
      const iceServers: RTCIceServer[] = [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
          ],
        },
      ];

      const peer = new Peer({
        stream,
        initiator,
        trickle: false,
        config: { iceServers },
      });

      peer.on("stream", (stream) => {
        setPeer((prevPeer) => {
          if (prevPeer) {
            return { ...prevPeer, stream };
          }
          return prevPeer;
        });
      });

      peer.on("error", (error) => {
        console.log("Peer connection error:", error);
      });

      peer.on("close", () => handleHangUp({}));

      const rtcPeerConnection: RTCPeerConnection = (peer as any)._pc;

      rtcPeerConnection.oniceconnectionstatechange = async () => {
        if (
          rtcPeerConnection.iceConnectionState == "disconnected" ||
          rtcPeerConnection.iceConnectionState == "failed"
        ) {
          handleHangUp({});
        }
      };

      return peer;
    },
    [handleHangUp, setPeer]
  );

  const getMediaStream = useCallback(
    async (callType: CallType = "video", facingMode?: string) => {
      if (localStream) {
        return localStream;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        const constraints: MediaStreamConstraints = {
          audio: true,
          video:
            callType === "video"
              ? {
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 360, ideal: 720, max: 1080 },
                  frameRate: { min: 15, ideal: 30, max: 60 },
                  facingMode: videoDevices.length > 0 ? facingMode : undefined,
                }
              : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.error(`Error accessing ${callType} devices.`, error);
        setLocalStream(null);
        return null;
      }
    },
    [localStream, setLocalStream]
  );

  const startCall = useCallback(
    async (callType: CallType = "video") => {
      setIsCallEnded(false);
      if (!chat) return;

      const stream = await getMediaStream(callType);

      if (!stream) {
        console.error(`Unable to access ${callType} devices.`);
        return;
      }

      const caller = {
        _id: currentUser?.id,
        name: currentUser?.name,
        avatarUrl: currentUser?.avatarUrl,
      };

      socket.emit(
        "call",
        {
          caller,
          receiver: { ...chat.partner },
          callType,
        },
        (response: any) => {
          if (response.status === 200) {
            console.log(
              `${callType} call initiated successfully`,
              response.data
            );
          } else {
            console.error(`Error initiating ${callType} call`, response.error);
          }
        }
      );

      router.push("/dashboard/calls");
    },
    [
      chat,
      currentUser?.avatarUrl,
      currentUser?.id,
      currentUser?.name,
      getMediaStream,
      router,
      setIsCallEnded,
    ]
  );

  const joinCall = useCallback(
    async (incomingCall: IncomingCall) => {
      const callType = incomingCall.callType || "video";
      setIsCallEnded(false);
      setIncomingCall({
        ...incomingCall,
        isRinging: false,
      });
      router.push("/dashboard/calls");

      const stream = await getMediaStream(callType);

      if (!stream) {
        console.error(`Unable to access ${callType} devices.`);
        return;
      }

      const newPeer = createPeerConnection(stream, true);

      setPeer({
        peerConnection: newPeer,
        stream: null,
        partner: { ...incomingCall.caller },
      });

      newPeer.on("signal", (data: SignalData) => {
        if (socket) {
          socket.emit("webrtcSignal", {
            sdp: data,
            incomingCall,
            isCaller: false,
          });
        }
      });
    },
    [
      createPeerConnection,
      getMediaStream,
      router,
      setIncomingCall,
      setIsCallEnded,
      setPeer,
    ]
  );

  return {
    startVideoCall: () => startCall("video"),
    startAudioCall: () => startCall("audio"),
    joinCall,
    handleHangUp,
    createPeerConnection,
  };
};

export default useMediaCall;
