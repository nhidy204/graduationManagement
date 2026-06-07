import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | Record<string, unknown>, locale = 'vi-VN') {
  // Handle invalid or serialized date objects
  if (!date) return 'N/A';
  
  let dateValue: string | Date = date as string | Date;
  
  // If it's a complex object (likely a serialized date), try to extract the value
  if (typeof date === 'object' && !(date instanceof Date)) {
    // Handle BSON serialized dates or similar
    const obj = date as Record<string, unknown>;
    if (obj.$date) {
      dateValue = new Date(obj.$date as string | number | Date);
    } else if (obj.toString && typeof obj.toString === 'function') {
      dateValue = new Date(obj.toString());
    } else {
      return 'N/A';
    }
  }

  const parsedDate = new Date(dateValue);
  if (isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsedDate);
}

export function formatDateTime(date: string | Date | Record<string, unknown>, locale = 'vi-VN') {
  // Handle invalid or serialized date objects
  if (!date) return 'N/A';
  
  let dateValue: string | Date = date as string | Date;
  
  // If it's a complex object (likely a serialized date), try to extract the value
  if (typeof date === 'object' && !(date instanceof Date)) {
    // Handle BSON serialized dates or similar
    const obj = date as Record<string, unknown>;
    if (obj.$date) {
      dateValue = new Date(obj.$date as string | number | Date);
    } else if (obj.toString && typeof obj.toString === 'function') {
      dateValue = new Date(obj.toString());
    } else {
      return 'N/A';
    }
  }

  const parsedDate = new Date(dateValue);
  if (isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate);
}