"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { DEFAULT_SIGNOUT_REDIRECT } from "@/routes";
import { revalidatePath } from "next/cache";
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
      {icon}
      {pathname === path && (
        <div className="absolute left-0 w-1 bg-blue-500 top-1 bottom-1 rounded-lg" />
      )}
    </Button>
  );
};

const SideBar = () => {
  const { currentUser } = useStore();

  const handleLogout = async () => {
    try {
      await signOut();
      revalidatePath(DEFAULT_SIGNOUT_REDIRECT);
    } catch (e) {
      console.log("Error signing out", e);
    }
  };

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
              src={currentUser?.avatarUrl ?? undefined}
              alt="User Avatar"
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
