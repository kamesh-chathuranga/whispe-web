"use client";

import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  LogOutIcon,
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
import { ReceivedFriendRequest } from "@/types/types";
import Notification from "./custom/notification";

const sideBarData = [
  {
    id: 1,
    icon: <MessageCircleMoreIcon />,
    path: "/chat",
  },
  {
    id: 2,
    icon: <PhoneIcon />,
    path: "/dashboard/calls",
  },
  {
    id: 3,
    icon: <UserPlusIcon />,
    path: "/dashboard/friends",
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
      className={`${pathname === path && "bg-accent"} relative mb-1`}
      onClick={() => router.push(path)}
    >
      {/* <div className="bg-blue-500 absolute -top-1 right-0 text-xs rounded-full px-[5px] py-[1px] text-white">
        5
      </div> */}
      {icon}
      {pathname === path && (
        <div className="absolute left-0 w-1 bg-blue-500 top-1 bottom-1 rounded-lg" />
      )}
    </Button>
  );
};

const SideBar = () => {
  const { currentUser, setCurrentUser, setFriendRequests, friendRequests } =
    useStore();
  // const [unseenNotificationCount, setUnseenRequestCount] = useState(0);
  const router = useRouter();
  const pathName = usePathname();

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

  useEffect(() => {
    if (!socket || !currentUser?.id) return;
    socket.emit("join", currentUser?.id);

    socket.on("friendRequestReceived", (request) => {
      const shouldNotified = pathName !== "/dashboard/friends";
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
            url="/dashboard/friends"
            senderName={newRequest.senderName}
            image={newRequest.senderImageUrl}
            message="Sent a friend request"
          />
        ),
        { position: "top-center" }
      );
    });

    return () => {
      socket.off("friendRequestReceived");
    };
  }, [currentUser?.id, friendRequests, pathName, setFriendRequests]);

  return (
    <div className="flex flex-col h-full items-center justify-between w-12 bg-slate-300/80 px-1 py-1.5">
      <div>
        <Button variant="ghost" size="icon" className="mb-3.5">
          <MenuIcon />
        </Button>
        {sideBarData.map((item) => (
          <NavigationButton key={item.id} icon={item.icon} path={item.path} />
        ))}
      </div>
      <div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOutIcon />
        </Button>
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
  );
};

export default SideBar;
