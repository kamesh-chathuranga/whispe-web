import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Smile } from "lucide-react";
import ReactEmojiPicker from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";

interface EmojiPickerProps {
  buttonClassName?: string;
  containerClassName?: string;
  onEmojiClick: MouseDownEvent;
}

const EmojiPicker = ({
  onEmojiClick,
  buttonClassName,
  containerClassName,
}: EmojiPickerProps) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const emojiPickerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const emojiPickerCloseHandler = (e: MouseEvent) => {
      if (
        (e.target as HTMLElement).id !== "emoji-picker" &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener("click", emojiPickerCloseHandler);
    return () => {
      document.removeEventListener("click", emojiPickerCloseHandler);
    };
  }, []);

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen((prev) => !prev);
  };
  return (
    <>
      <Button
        variant="ghost"
        onClick={toggleEmojiPicker}
        id="emoji-picker"
        className={buttonClassName}
      >
        <Smile />
      </Button>

      {isEmojiPickerOpen && (
        <div
          className={cn("absolute bottom-24 left-16 z-50", containerClassName)}
          ref={emojiPickerRef}
        >
          <ReactEmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </>
  );
};

export default EmojiPicker;
