import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and resolves Tailwind CSS conflicts using tailwind-merge
 *
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns Merged and conflict-resolved class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden)
 * cn('text-red-500', { 'text-blue-500': isBlue }) // Conditionally applies classes
 * cn(['bg-white', 'text-black'], undefined, 'hover:bg-gray-100') // Handles mixed inputs
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
