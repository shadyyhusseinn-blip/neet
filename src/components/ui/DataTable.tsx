import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowUpDown, Filter, Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { cn } from '../../lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  enableExport?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  enableExport = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title || 'Data');
    XLSX.writeFile(wb, `${title || 'data'}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title || 'Report', 14, 15);
    
    let y = 30;
    const headers = columns.map((col) => (col as any).header || '');
    const headerWidth = 180 / headers.length;
    
    // Headers
    doc.setFontSize(10);
    headers.forEach((header, i) => {
      doc.text(header, 14 + i * headerWidth, y);
    });
    
    y += 10;
    
    // Data rows
    doc.setFontSize(8);
    data.forEach((row: any) => {
      Object.values(row).forEach((value: any, i) => {
        const text = String(value).substring(0, 20);
        doc.text(text, 14 + i * headerWidth, y);
      });
      y += 7;
      
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    
    doc.save(`${title || 'report'}.pdf`);
  };

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {enableExport && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition-all"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-all"
              >
                <FileText size={16} />
                PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="بحث..."
            value={(table.getState().globalFilter as string) ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full h-10 pr-10 pl-4 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-right text-sm font-semibold text-gray-300"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-2 cursor-pointer select-none',
                          header.column.getCanSort() && 'hover:text-white'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>عرض</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded border border-white/10 bg-white/5 text-white px-2"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>من أصل {table.getFilteredRowModel().rows.length} سجل</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            الأول
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            السابق
          </button>
          <span className="text-sm text-gray-400">
            صفحة {table.getState().pagination.pageIndex + 1} من{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            التالي
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            الأخير
          </button>
        </div>
      </div>
    </div>
  );
}
