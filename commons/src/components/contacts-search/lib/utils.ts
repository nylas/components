import type { CallbackDebounceFunction } from "@commons/types/ContactsSearch.ts";

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
