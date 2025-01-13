// utils/dateFormatters.ts - Specific date formatting utilities
/**
 * Formats a date string into a localized format (DD/MM/YYYY HH:mm:ss)
 * @param dateValue Date string to format or null
 * @returns Formatted date string or dash if invalid/null
 */
export const formatDateTime = (dateValue: string | null): string => {
    // Return dash for null values
    if (!dateValue) return '—';
    
    // Parse the date and validate
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '—';
    
    // Format each component with padding
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};