import { clsx } from "clsx";
import { format } from "date-fns";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
