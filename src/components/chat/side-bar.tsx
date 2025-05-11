/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  MenuIcon,
  MessageCircleMoreIcon,
  PhoneIcon,
  SettingsIcon,
  User,
  UserPlusIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store";
import API from "@/lib/axios";
import { DEFAULT_SIGNOUT_REDIRECT } from "@/routes";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import socket from "@/lib/socket";
import {
  FriendStatus,
  IncomingCall,
  Message,
  ReceivedFriendRequest,
} from "@/types/types";
import Notification from "../custom/notification";
import CallNotification from "../custom/call-notification";
import { SignalData } from "simple-peer";
import useVideoCall from "@/hooks/use-media-call";
import LogoutButton from "../custom/logout-button";

const sideBarData = [
  {
    id: 1,
    icon: <MessageCircleMoreIcon />,
    path: "/chat",
  },
  {
    id: 2,
    icon: <PhoneIcon />,
    path: "/calls",
  },
  {
    id: 3,
    icon: <UserPlusIcon />,
    path: "/friends",
  },
];

interface NavigationButtonProps {
  icon: React.JSX.Element;
  path: string;
}

const NavigationButton = ({ icon, path }: NavigationButtonProps) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Button
      key={path}
      variant="ghost"
      size="icon"
      className={`${pathname.includes(path) && "bg-accent"} relative mb-1`}
      onClick={() => router.push(path)}
    >
      {/* <div className="bg-blue-500 absolute -top-1 right-0 text-xs rounded-full px-[5px] py-[1px] text-white">
        5
      </div> */}
      {icon}
      {pathname.includes(path) && (
        <div className="absolute left-0 w-1 bg-green-500 top-1 bottom-1 rounded-lg" />
      )}
    </Button>
  );
};

const SideBar = () => {
  const {
    currentUser,
    setCurrentUser,
    setFriendRequests,
    friendRequests,
    chatList,
    setChatList,
    messages,
    setMessages,
    incomingCall: incomingCallDetails,
    setIncomingCall,
    localStream,
    peer,
    setPeer,
    friendStatuses,
    setFriendStatuses,
  } = useStore();
  // const [unseenNotificationCount, setUnseenRequestCount] = useState(0);
  const router = useRouter();
  const pathName = usePathname();
  const { createPeerConnection, handleHangUp } = useVideoCall();

  useEffect(() => {
    socket.on("friends:status", (friendStatuses: FriendStatus[]) => {
      setFriendStatuses(friendStatuses);
    });

    socket.on("friend:status", (status: FriendStatus) => {
      const updatedStatuses = friendStatuses.map((friend: FriendStatus) => {
        if (friend.userId === status.userId) {
          return status;
        }
        return friend;
      });

      setFriendStatuses(updatedStatuses);
    });

    return () => {
      socket.off("friends:status");
      socket.off("friend:status");
    };
  }, [friendStatuses, setFriendStatuses]);

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    chatList.forEach((chat) => {
      socket.emit("join:chat", chat._id, (res: any) => {
        if (res.status !== 200) console.log(res.error);
      });
    });

    socket.on("friendRequest:received", (request) => {
      const shouldNotified = pathName !== "/friends";
      const newRequest: ReceivedFriendRequest = {
        id: request._id,
        senderName: request.sender.name,
        senderImageUrl: request.sender?.avatarUrl,
      };
      setFriendRequests([...friendRequests, newRequest]);

      if (!shouldNotified) return;
      toast.custom(
        (t) => (
          <Notification
            t={t}
            url="/friends"
            senderName={newRequest.senderName}
            image={newRequest.senderImageUrl}
            message="Sent a friend request"
          />
        ),
        { position: "top-center" }
      );
    });

    socket.on("message:new", (message: Message) => {
      if (message.sender._id !== currentUser.id) {
        socket.emit("message:delivered", { messageId: message._id });
      }

      const chat = chatList.map((chat) =>
        chat._id === message.chat ? { ...chat, lastMessage: message } : chat
      );
      setChatList(chat);
      setMessages([...messages, message]);
      const shouldNotified =
        pathName !== `/chat/${message.chat}` &&
        currentUser.id !== message.sender._id;

      if (!shouldNotified) return;

      toast.custom(
        (t) => (
          <Notification
            t={t}
            url={`/chat/${message.chat}`}
            senderName={message.sender.name}
            image={message.sender.avatarUrl}
            message={message.content}
          />
        ),
        { position: "top-center" }
      );
    });

    return () => {
      socket.off("friendRequest:received");
      socket.off("message:new");
    };
  }, [
    chatList,
    currentUser?.id,
    friendRequests,
    messages,
    pathName,
    setChatList,
    setFriendRequests,
    setMessages,
  ]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", (request) => {
      setIncomingCall({ ...request, isRinging: true });
    });

    socket.on(
      "webrtcSignal",
      (response: {
        sdp: SignalData;
        incomingCall: IncomingCall;
        isCaller: boolean;
      }) => {
        if (!localStream) {
          return;
        }

        if (peer) {
          peer.peerConnection.signal(response.sdp);
          return;
        }

        const newPeer = createPeerConnection(localStream, true);

        setPeer({
          peerConnection: newPeer,
          stream: null,
          partner: { ...response.incomingCall.receiver },
        });

        newPeer.on("signal", (data: SignalData) => {
          if (socket) {
            socket.emit("webrtcSignal", {
              sdp: data,
              incomingCall: response.incomingCall,
              isCaller: true,
            });
          }
        });
      }
    );

    socket.on("call:hangup", handleHangUp);

    return () => {
      socket.off("call:incoming");
      socket.off("webrtcSignal");
      socket.off("call:hangup", handleHangUp);
    };
  }, [
    createPeerConnection,
    handleHangUp,
    localStream,
    peer,
    setIncomingCall,
    setPeer,
  ]);

  const handleLogout = async () => {
    try {
      const response = await API.post("/auth/logout", undefined);

      if (response.status == 200 && response.data) {
        setCurrentUser(null);
        router.replace(DEFAULT_SIGNOUT_REDIRECT);
      } else {
        toast.error("Failed to logout user");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("An error occurred while logging out. Please try again.");
      }
    }
  };

  return (
    <>
      <CallNotification
        incomingCall={incomingCallDetails}
        currentUserId={currentUser?.id}
      />
      <div className="flex flex-col h-full items-center justify-between w-12 bg-gray-100/50 border-r-2 px-1 py-1.5">
        <div>
          <Button variant="ghost" size="icon" className="mb-3.5">
            <MenuIcon />
          </Button>
          {sideBarData.map((item) => (
            <NavigationButton key={item.id} icon={item.icon} path={item.path} />
          ))}
        </div>
        <div>
          <LogoutButton onLogout={handleLogout} />
          <Button variant="ghost" size="icon" className="mb-2">
            <SettingsIcon />
          </Button>
          <Button variant="ghost" size="icon">
            <Avatar className="w-8 h-8">
              <AvatarImage
                referrerPolicy="no-referrer"
                src={currentUser?.avatarUrl ?? undefined}
                alt={`${currentUser?.name}'s Avatar`}
              />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </>
  );
};

export default SideBar;
