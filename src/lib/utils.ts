import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateEmail(email: string): boolean {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || trimmedEmail.length > 254) return false;
  if (
    trimmedEmail.includes("..") ||
    trimmedEmail.startsWith(".") ||
    trimmedEmail.endsWith(".")
  )
    return false;

  // More robust email regex
  const emailRegex =
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(trimmedEmail);
}

export function validateAmount(amount: string): boolean {
  if (!amount.trim()) return true;
  const num = Number(amount);
  return !isNaN(num) && num >= 0 && num <= 999999999; // Reasonable business limits
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

export function validateCompanyName(company: string): boolean {
  return company.trim().length >= 1 && company.trim().length <= 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return formatCurrency(amount);
}

export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatTrend(
  current: number,
  previous: number,
): {
  value: string;
  direction: "up" | "down" | "neutral";
  percentage: number;
} {
  if (previous === 0) {
    return { value: "N/A", direction: "neutral", percentage: 0 };
  }

  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral";

  return {
    value: `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
    direction,
    percentage: Math.abs(percentage),
  };
}
