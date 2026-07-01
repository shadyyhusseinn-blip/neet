/**
 * Table Component
 * مكون Table موحد لعرض البيانات
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'bordered' | 'striped';
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const variants = {
      default: '',
      bordered: 'border border-white/10',
      striped: '',
    };

    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full text-right',
            variants[variant],
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-white/5', className)}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));

TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-white/5 font-semibold', className)}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { striped?: boolean }
>(({ className, striped, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-white/10 transition-colors hover:bg-white/5',
      striped && 'even:bg-white/5',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider',
      className
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 text-sm text-gray-300', className)}
    {...props}
  />
));

TableCell.displayName = 'TableCell';

/**
 * Table with pagination
 */
interface TableWithPaginationProps extends Omit<TableProps, 'children'> {
  children: React.ReactNode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function TableWithPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  children,
  ...props
}: TableWithPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage! + 1;
  const endItem = Math.min(currentPage * itemsPerPage!, totalItems!);

  return (
    <div className="space-y-4">
      <Table {...props}>{children}</Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        {totalItems && itemsPerPage && (
          <div className="text-sm text-gray-400">
            عرض {startItem} إلى {endItem} من أصل {totalItems}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            السابق
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm',
                currentPage === page
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white hover:bg-white/10'
              )}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
