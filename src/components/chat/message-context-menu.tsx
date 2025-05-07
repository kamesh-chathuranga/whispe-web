import { Copy, Reply, Trash } from "lucide-react";
import { Message } from "@/types/types";
import socket from "@/lib/socket";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageContextMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  message: Message;
  isOwn: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

const MessageContextMenu = ({
  open,
  onOpenChange,
  position,
  message,
  isOwn,
  ref,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight;
      const menuWidth = menuRef.current.offsetWidth;

      // Find the message container element
      // const container = document.querySelector('.h-[80vh]');
      const containerRect = ref.current?.getBoundingClientRect();

      if (!containerRect) return;

      // Calculate container bounds
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const containerLeft = containerRect.left;
      const containerRight = containerRect.right;

      // Consider scroll position for vertical positioning
      // const containerScrollTop = container?.scrollTop || 0;

      // By default position above the click point
      let top = position.y - menuHeight;
      let left = position.x;

      // Check if menu would go beyond container top edge
      if (top < containerTop) {
        // Position below the click point if not enough space above
        top = position.y;
      }

      // Check if menu would go beyond container bottom edge
      if (top + menuHeight > containerBottom) {
        // Adjust to fit within container
        top = Math.max(containerTop, containerBottom - menuHeight);
      }

      // Check if menu would go beyond container right edge
      if (left + menuWidth > containerRight) {
        left = Math.max(containerLeft, position.x - menuWidth);
      }

      // Check if menu would go beyond container left edge
      if (left < containerLeft) {
        left = containerLeft;
      }

      setMenuPosition({ top, left });
    }
  }, [open, position, menuRef, ref]);

  const handleDeleteForMe = useCallback(() => {
    if (message._id) {
      socket.emit("message:deleteForMe", { messageId: message._id });
      onOpenChange(false);
    }
  }, [message._id, onOpenChange]);

  const handleDeleteForEveryone = useCallback(() => {
    if (message._id && isOwn) {
      socket.emit("message:deleteForEveryone", { messageId: message._id });
      onOpenChange(false);
    }
  }, [message._id, isOwn, onOpenChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    onOpenChange(false);
  }, [message.content, onOpenChange]);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="hidden" />
      <DropdownMenuContent
        ref={menuRef}
        side="right"
        sideOffset={5}
        align="start"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          zIndex: 50,
          maxHeight: "calc(80vh - 20px)", // Ensure menu doesn't exceed container height
          overflowY: "auto",
        }}
        className="w-48"
        onContextMenu={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Reply className="mr-2 h-4 w-4" />
          <span>Reply</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteForMe}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete for me</span>
        </DropdownMenuItem>
        {isOwn && (
          <DropdownMenuItem onClick={handleDeleteForEveryone}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete for everyone</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageContextMenu;
