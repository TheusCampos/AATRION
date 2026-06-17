import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes do Tailwind de forma inteligente,
 * resolvendo conflitos entre variantes utilitárias.
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-primary', 'px-4') // 'py-1 bg-primary px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
