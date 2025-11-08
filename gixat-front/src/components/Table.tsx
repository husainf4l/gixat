"use client";

interface TableHeaderProps {
  columns: string[];
  withCheckbox?: boolean;
}

export function TableHeader({ columns, withCheckbox = false }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {withCheckbox && (
          <th className="px-6 py-3 text-left">
            <input type="checkbox" disabled className="w-4 h-4 rounded opacity-50" />
          </th>
        )}
        {columns.map((column) => (
          <th key={column} className="px-6 py-3 text-left">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{column}</span>
          </th>
        ))}
        <th className="px-6 py-3 text-right">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</span>
        </th>
      </tr>
    </thead>
  );
}

interface TableSkeletonProps {
  columns: string[];
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <TableHeader columns={columns} />
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                </td>
              ))}
              <td className="px-6 py-4 text-right">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/4 ml-auto"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TablePagination() {
  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
      <div className="text-sm text-gray-600">Showing 0 of 0 results</div>
      <div className="flex gap-2">
        <button disabled className="px-3 py-1 border border-gray-300 rounded opacity-50 cursor-not-allowed text-sm">
          ← Previous
        </button>
        <button disabled className="px-3 py-1 border border-gray-300 rounded opacity-50 cursor-not-allowed text-sm">
          Next →
        </button>
      </div>
    </div>
  );
}
