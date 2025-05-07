import { useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Search, Settings, UserPlus } from "lucide-react";

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
  const handleRefresh = useCallback(() => {
    // Implement refresh logic here
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSearch = useCallback(() => {
    // Implement search in chat logic
    onOpenChange(false);
  }, [onOpenChange]);

  const handleAddParticipant = useCallback(() => {
    // Implement add participant logic
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSettings = useCallback(() => {
    // Implement chat settings logic
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="hidden" />
      <DropdownMenuContent
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          zIndex: 50,
        }}
        className="w-48"
        onContextMenu={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          <span>Search in chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Refresh</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddParticipant}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>Add participant</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Chat settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatContextMenu;
