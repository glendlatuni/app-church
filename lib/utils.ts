/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS
 * Uses clsx for conditional classes and twMerge to handle Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to a readable format
 * @param dateStr - Date string in ISO format
 * @returns Formatted date string (e.g., "28 Februari 2023")
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  
  // Format to Indonesian date format
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Get nested property from an object by string path
 * @param obj - The object to get value from
 * @param path - The path in dot notation (e.g., "user.address.city")
 * @returns The value at the path or null if path doesn't exist
 */
export function getNestedValue<T = any>(obj: any, path: string): T | null {
  if (!obj || !path) return null;
  
  const keys = path.split(".");
  let value = obj;
  
  for (const key of keys) {
    if (value === undefined || value === null) return null;
    value = value[key];
  }
  
  return value as T;
}

/**
 * Debounce function to limit how often a function can be called
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}