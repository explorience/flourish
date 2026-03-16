"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const GUEST_STORAGE_KEY = "potluck-guest";

interface GuestIdentity {
  name: string;
  email: string;
}

export function getStoredGuestIdentity(): GuestIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeGuestIdentity(identity: GuestIdentity) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(identity));
}

interface GuestIdentityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => void;
}

export function GuestIdentityModal({
  open,
  onClose,
  onSubmit,
}: GuestIdentityModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = getStoredGuestIdentity();
    if (stored) {
      setName(stored.name);
      setEmail(stored.email);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    storeGuestIdentity({ name: name.trim(), email: email.trim() });
    onSubmit(name.trim(), email.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>What&apos;s your name?</DialogTitle>
          <DialogDescription>
            So everyone knows who&apos;s bringing what.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-name">Display name *</Label>
            <Input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <p className="text-xs text-muted-foreground">
              For notifications if the host verifies your contribution.
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="submit" disabled={!name.trim()} className="w-full">
              Continue
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Want to earn points?{" "}
              <Link href="/auth/login" className="text-primary underline">
                Create an account
              </Link>
            </p>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
