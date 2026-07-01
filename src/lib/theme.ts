/** Status & semantic color class maps */
export const STATUS_BADGE = {
  pending: 'badge-warning',
  temporary: 'badge-warning',
  confirmed: 'badge-success',
  editing: 'badge-primary',
  ready: 'badge-accent',
  delivered: 'badge-muted',
  paid: 'badge-success',
  deposit: 'badge-primary',
  unpaid: 'badge-danger',
} as const;

export function statusBadge(status: string): string {
  return STATUS_BADGE[status as keyof typeof STATUS_BADGE] ?? 'badge-muted';
}
