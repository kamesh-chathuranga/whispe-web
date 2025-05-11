import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Camera, File, ImageIcon, Paperclip } from "lucide-react";

const AttachmentDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Paperclip />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem>
          <ImageIcon />
          <span>Photos & Videos</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Camera />
          <span>Camera</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <File />
          <span>Document</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AttachmentDropdown;
