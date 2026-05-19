import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function uomLabel(type: string): string {
  const map: Record<string, string> = {
    numeric_min: 'Numeric (Min)',
    numeric_max: 'Numeric (Max)',
    timeline: 'Timeline',
    zero: 'Zero-based',
  };
  return map[type] ?? type;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    returned: 'Returned',
    not_started: 'Not Started',
    on_track: 'On Track',
    completed: 'Completed',
  };
  return map[status] ?? status;
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    returned: 'bg-red-50 text-red-700 border-red-200',
    not_started: 'bg-gray-100 text-gray-600 border-gray-200',
    on_track: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}
