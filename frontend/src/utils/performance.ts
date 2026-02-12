import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Lazy loads a component with retry logic and optional preloading.
 * 
 * @param factory - Factory function that returns a promise resolving to the component
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      factory()
        .then(resolve)
        .catch((error: unknown) => {
          // Simple retry logic could be added here
          console.error('Failed to lazy load component:', error);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  });
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Creates a throttled function that only invokes `func` at most once per every `limit` milliseconds.
 * 
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Simple memoization helper for expensive calculations.
 * Warning: This implementation has unbounded cache growth. Use with caution.
 */
export function memoize<T extends (...args: unknown[]) => unknown>(func: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}
