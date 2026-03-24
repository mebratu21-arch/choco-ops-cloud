import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind classes and handles conflicts (Staff-Level Utility)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
