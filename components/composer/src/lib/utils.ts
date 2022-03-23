import type { CallbackDebounceFunction } from "@commons/types/ContactsSearch";

export const debounce = (
  func: CallbackDebounceFunction,
  wait: number,
): CallbackDebounceFunction => {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: unknown[]): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const calculateMessageTempSnippet = (body: string): string => {
  if (!body) return "";
  return (
    body
      // Remove style and script tag and content
      .replace(/<style|script([\S\s]*?)>([\S\s]*?)<\/style|script>/g, "")
      // Remove all tags and keep content / Remove all HTML entities
      ?.replace(/<\/?[^>]+(>|$)|(&.+?;)/g, "")
      // Remove extra spaces
      ?.replace(/\s+/g, " ")
      // Remove leading and trailing space
      ?.trim()
      // Add ... for longer message
      ?.substring(0, 190) + (body.length > 190 ? "..." : "")
  );
};
