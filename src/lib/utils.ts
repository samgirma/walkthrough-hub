import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(number: number): string {
  if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (number >= 1_000) {
    return (number / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return number.toString();
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getCategoryColor(category: string): {
  color: string;
  bg: string;
  border: string;
  text: string;
} {
  const cat = category.toUpperCase();
  switch (cat) {
    case "WEB":
      return {
        color: "#38BDF8",
        bg: "rgba(56, 189, 248, 0.1)",
        border: "rgba(56, 189, 248, 0.25)",
        text: "text-sky-400",
      };
    case "PWN":
      return {
        color: "#F43F5E",
        bg: "rgba(244, 63, 94, 0.1)",
        border: "rgba(244, 63, 94, 0.25)",
        text: "text-rose-400",
      };
    case "CRYPTO":
      return {
        color: "#A855F7",
        bg: "rgba(168, 85, 247, 0.1)",
        border: "rgba(168, 85, 247, 0.25)",
        text: "text-purple-400",
      };
    case "REVERSE":
      return {
        color: "#FB923C",
        bg: "rgba(251, 146, 60, 0.1)",
        border: "rgba(251, 146, 60, 0.25)",
        text: "text-orange-400",
      };
    case "FORENSICS":
      return {
        color: "#14B8A6",
        bg: "rgba(20, 184, 166, 0.1)",
        border: "rgba(20, 184, 166, 0.25)",
        text: "text-teal-400",
      };
    case "OSINT":
      return {
        color: "#EAB308",
        bg: "rgba(234, 179, 8, 0.1)",
        border: "rgba(234, 179, 8, 0.25)",
        text: "text-yellow-400",
      };
    case "MISC":
    default:
      return {
        color: "#94A3B8",
        bg: "rgba(148, 163, 184, 0.1)",
        border: "rgba(148, 163, 184, 0.25)",
        text: "text-slate-400",
      };
  }
}

export function getDifficultyColor(difficulty: string): {
  color: string;
  dot: string;
  text: string;
} {
  const diff = difficulty.toUpperCase();
  switch (diff) {
    case "EASY":
      return {
        color: "#22C55E",
        dot: "bg-emerald-500",
        text: "text-emerald-400",
      };
    case "MEDIUM":
      return {
        color: "#F59E0B",
        dot: "bg-amber-500",
        text: "text-amber-400",
      };
    case "HARD":
      return {
        color: "#EF4444",
        dot: "bg-red-500",
        text: "text-red-400",
      };
    case "INSANE":
      return {
        color: "#EC4899",
        dot: "bg-pink-500",
        text: "text-pink-400",
      };
    default:
      return {
        color: "#94A3B8",
        dot: "bg-slate-500",
        text: "text-slate-400",
      };
  }
}
