import {
  Copy,
  Forward,
  Info,
  Pin,
  Reply,
  Share,
  SquareCheck,
  Star,
  Trash2,
} from "lucide-react";
import { Message } from "@/types/types";
import socket from "@/lib/socket";
import { useCallback, useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "../ui/separator";

interface MessageContextMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message;
  isOwn: boolean;
  position: { x: number; y: number };
}

const MENU_WIDTH = 192;
const MENU_HEIGHT = 325;

export default function MessageContextMenu({
  open,
  onOpenChange,
  message,
  // isOwn,
  position,
}: MessageContextMenuProps) {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!open) return;

    const viewportWidth = window.innerWidth;
    const x =
      position.x + MENU_WIDTH > viewportWidth
        ? Math.max(0, position.x - MENU_WIDTH)
        : position.x;

    let y = position.y - MENU_HEIGHT;
    if (y < 0) y = 0;

    setAdjustedPosition({ x, y });
  }, [open, position]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    onOpenChange(false);
  }, [message.content, onOpenChange]);

  // const handleDeleteForEveryone = useCallback(() => {
  //   if (message._id && isOwn) {
  //     socket.emit("message:deleteForEveryone", { messageId: message._id });
  //     onOpenChange(false);
  //   }
  // }, [message._id, isOwn, onOpenChange]);

  const handleDeleteForMe = useCallback(() => {
    if (message._id) {
      socket.emit("message:deleteForMe", { messageId: message._id });
      onOpenChange(false);
    }
  }, [message._id, onOpenChange]);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      {/* Hidden trigger since we're manually positioning */}
      <DropdownMenuTrigger className="hidden" />

      <DropdownMenuContent
        style={{
          position: "fixed",
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          zIndex: 50,
        }}
        className="w-48 origin-bottom-left"
        onContextMenu={(e) => e.preventDefault()}
      >
        <DropdownMenuItem>
          <Reply className="mr-2 h-4 w-4" />
          <span>Reply</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy</span>
        </DropdownMenuItem>
        <Separator className="my-1" />

        <DropdownMenuItem>
          <Forward className="mr-2 h-4 w-4" />
          <span>Forward</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Star className="mr-2 h-4 w-4" />
          <span>Star</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pin className="mr-2 h-4 w-4" />
          <span>Pin</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteForMe}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
        <Separator className="my-1" />

        <DropdownMenuItem>
          <SquareCheck className="mr-2 h-4 w-4" />
          <span>Select</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <Separator className="my-1" />

        <DropdownMenuItem>
          <Info className="mr-2 h-4 w-4" />
          <span>Info</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
