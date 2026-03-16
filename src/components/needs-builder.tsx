"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/emoji-picker";

export interface NeedItem {
  id: string;
  emoji: string;
  name: string;
  quantity: number;
  point_value: number | null;
}

interface NeedsBuilderProps {
  needs: NeedItem[];
  onChange: (needs: NeedItem[]) => void;
  pointsEnabled: boolean;
}

let nextId = 0;
function generateId() {
  return `need-${Date.now()}-${nextId++}`;
}

export function NeedsBuilder({
  needs,
  onChange,
  pointsEnabled,
}: NeedsBuilderProps) {
  const addNeed = () => {
    onChange([
      ...needs,
      {
        id: generateId(),
        emoji: "🍽️",
        name: "",
        quantity: 1,
        point_value: pointsEnabled ? 10 : null,
      },
    ]);
  };

  const updateNeed = (id: string, updates: Partial<NeedItem>) => {
    onChange(
      needs.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const removeNeed = (id: string) => {
    onChange(needs.filter((n) => n.id !== id));
  };

  const moveNeed = (fromIndex: number, toIndex: number) => {
    const updated = [...needs];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {needs.map((need, index) => (
          <div
            key={need.id}
            className="flex items-center gap-2 p-3 rounded-lg border bg-card group"
          >
            <button
              type="button"
              className="cursor-grab text-muted-foreground hover:text-foreground shrink-0"
              title="Drag to reorder"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (index > 0) moveNeed(index, index - 1);
              }}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <EmojiPicker
              value={need.emoji}
              onChange={(emoji) => updateNeed(need.id, { emoji })}
            />

            <Input
              placeholder="What's needed?"
              value={need.name}
              onChange={(e) => updateNeed(need.id, { name: e.target.value })}
              className="flex-1"
            />

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-muted-foreground">Qty:</span>
              <Input
                type="number"
                min={1}
                max={99}
                value={need.quantity}
                onChange={(e) =>
                  updateNeed(need.id, {
                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-16 text-center"
              />
            </div>

            {pointsEnabled && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">Pts:</span>
                <Input
                  type="number"
                  min={0}
                  value={need.point_value ?? 0}
                  onChange={(e) =>
                    updateNeed(need.id, {
                      point_value: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-16 text-center"
                />
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeNeed(need.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addNeed}
        className="w-full border-dashed"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add a need
      </Button>
    </div>
  );
}
