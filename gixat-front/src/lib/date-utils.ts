/**
 * Date utility functions for formatting dates to backend-compatible formats
 */

/**
 * Formats an ISO date string to backend DateTime format
 * Ensures proper ISO 8601 format with timezone
 * 
 * @param isoString - ISO 8601 date string or partial date string
 * @returns Backend-compatible date format (full ISO 8601 with timezone)
 * 
 * @example
 * formatDateForBackend("2025-11-10T10:05:28.238Z") // Returns: "2025-11-10T10:05:28.238Z"
 * formatDateForBackend("2025-11-10T10:05:28") // Returns: "2025-11-10T10:05:28.000Z"
 */
export function formatDateForBackend(isoString: string): string {
  // If already a full ISO string, return as-is
  if (isoString.includes('Z') || isoString.includes('+')) {
    return isoString;
  }
  
  // Otherwise, parse and convert to full ISO string
  const date = new Date(isoString);
  return date.toISOString();
}

/**
 * Converts a Date object to backend DateTime format
 * 
 * @param date - Date object
 * @returns Backend-compatible date format (e.g., "2025-11-10T10:05:28")
 */
export function dateToBackendFormat(date: Date): string {
  return formatDateForBackend(date.toISOString());
}

/**
 * Gets current date/time in backend-compatible format
 * 
 * @returns Current date/time in backend format (e.g., "2025-11-10T10:05:28")
 */
export function getCurrentDateForBackend(): string {
  return dateToBackendFormat(new Date());
}
