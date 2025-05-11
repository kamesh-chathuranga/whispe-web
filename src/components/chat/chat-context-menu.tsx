import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SquareArrowOutUpRight, SquareCheck, X } from "lucide-react";

const MENU_WIDTH = 192;
const MENU_HEIGHT = 50;

interface ChatContextMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
}

const ChatContextMenu = ({
  open,
  onOpenChange,
  position,
}: ChatContextMenuProps) => {
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

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="hidden" />
      <DropdownMenuContent
        style={{
          position: "fixed",
          top: adjustedPosition.y,
          left: adjustedPosition.x,
          zIndex: 50,
        }}
        className="w-48"
        onContextMenu={(e) => e.preventDefault()}
      >
        <DropdownMenuItem>
          <SquareCheck className="mr-2 h-4 w-4" />
          <span>Select messages</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
          <span>Pop-out chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <X className="mr-2 h-4 w-4" />
          <span>Close chat</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatContextMenu;
