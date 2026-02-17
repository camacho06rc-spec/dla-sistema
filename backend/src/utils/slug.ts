/**
 * Generates a URL-friendly slug from a string
 * - Converts to lowercase
 * - Removes diacritics (accents)
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
