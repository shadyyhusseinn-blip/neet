import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { ChevronUp, ChevronDown, MoreHorizontal, Filter, Search } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  pageSize?: number;
  searchable?: boolean;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  selectable = false,
  onSelectionChange,
  pageSize,
  searchable = false,
  className,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to safely convert to lowercase string
  const toLowerString = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val).toLowerCase();
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Filter data
  const filteredData = useMemo(() => {
    return sortedData.filter((row) => {
      // Apply column filters
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue;
        const rowValue = row[key as keyof T];
        const rowStr = toLowerString(rowValue);
        if (rowStr.includes(value.toLowerCase())) {
          continue;
        }
        return false;
      }

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return Object.values(row).some((val) => {
          const strVal = toLowerString(val);
          return strVal.includes(query);
        });
      }

      return true;
    });
  }, [sortedData, filters, searchQuery]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pageSize) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = pageSize ? Math.ceil(filteredData.length / pageSize) : 1;

  // Handle sort
  const handleSort = (key: keyof T) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  // Handle filter
  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle selection
  const handleSelectRow = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(filteredData.filter((row) => newSelected.has(String(row.id || row.key))));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(paginatedData.map((row) => String(row.id || row.key)));
      setSelectedRows(allIds);
    }
    onSelectionChange?.(paginatedData);
  };

  const allSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < paginatedData.length;

  return (
    <div className={cn('w-full', className)}>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {selectable && (
                <th className="px-4 py-3 text-right">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={cn(
                    'px-4 py-3 text-right text-sm font-medium text-gray-300',
                    column.sortable && 'cursor-pointer hover:text-white transition-colors'
                  )}
                  onClick={() => column.sortable && handleSort(column.key as keyof T)}
                >
                  <div className="flex items-center gap-2 justify-end">
                    {column.title}
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">
                  جاري التحميل...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={cn(
                    'border-b border-white/5 hover:bg-white/5 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(String(row.id || row.key))}
                        onChange={() => handleSelectRow(String(row.id || row.key))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-300">
                      {column.render ? column.render(row[column.key as keyof T], row) : String(row[column.key as keyof T] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-400">
            عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, filteredData.length)} من {filteredData.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm',
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
