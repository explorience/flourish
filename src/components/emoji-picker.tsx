"use client";

import { useState } from "react";
import { COMMON_EMOJIS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 text-xl shrink-0"
          type="button"
        >
          {value}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pick an emoji</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-8 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="h-10 w-10 flex items-center justify-center text-xl rounded-lg hover:bg-muted transition-colors"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
