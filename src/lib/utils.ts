import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function getClaimProgress(
  needs: { quantity: number; claimed_quantity: number }[]
): { claimed: number; total: number; percentage: number } {
  const total = needs.reduce((sum, n) => sum + n.quantity, 0);
  const claimed = needs.reduce((sum, n) => sum + n.claimed_quantity, 0);
  const percentage = total > 0 ? Math.round((claimed / total) * 100) : 0;
  return { claimed, total, percentage };
}
