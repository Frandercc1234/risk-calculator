import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@risk-calculator/shared';
import type { RiskEntry, RiskType } from '@risk-calculator/shared';
import { api } from '../lib/api';
import { RiskBadge } from '../components/RiskBadge';

const columnHelper = createColumnHelper<RiskEntry>();

export function RisksList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selectedRisk, setSelectedRisk] = useState<RiskEntry | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'risks',
      {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        type: columnFilters.find((f) => f.id === 'type')?.value as RiskType,
        sortBy: sorting[0]?.id,
        order: sorting[0]?.desc ? 'desc' : 'asc',
      },
    ],
    queryFn: () =>
      api.getRisks({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        type: columnFilters.find((f) => f.id === 'type')?.value as RiskType,
        sortBy: sorting[0]?.id as any,
        order: sorting[0]?.desc ? 'desc' : 'asc',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteRisk,
    onSuccess: () => {
      toast.success('Risk deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete risk');
    },
  });

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span className="capitalize font-medium">{info.getValue()}</span>
        ),
        filterFn: 'equals',
      }),
      columnHelper.accessor('input', {
        id: 'asset',
        header: 'Asset',
        cell: (info) => {
          const input = info.getValue();
          if (info.row.original.type === 'qualitative') {
            return (input as any).assetName;
          } else {
            return `Asset (${formatCurrency((input as any).assetValue)})`;
          }
        },
      }),
      columnHelper.accessor('output', {
        id: 'inherent',
        header: 'Inherent',
        cell: (info) => {
          const output = info.getValue();
          if (info.row.original.type === 'qualitative') {
            return <RiskBadge band={(output as any).inherentBand} />;
          } else {
            return formatCurrency((output as any).aleInherent);
          }
        },
      }),
      columnHelper.accessor('output', {
        id: 'residual',
        header: 'Residual',
        cell: (info) => {
          const output = info.getValue();
          if (info.row.original.type === 'qualitative') {
            return <RiskBadge band={(output as any).residualBand} />;
          } else {
            return formatCurrency((output as any).aleResidual);
          }
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedRisk(info.row.original)}
              className="text-blue-600 hover:text-blue-500"
              title="View details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to delete this risk assessment?'
                  )
                ) {
                  deleteMutation.mutate(info.row.original.id);
                }
              }}
              className="text-red-600 hover:text-red-500"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    [deleteMutation]
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    pageCount: data?.pagination.totalPages || 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Failed to load risks: {(error as any).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          All Risk Assessments
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View, filter, and manage all your risk assessments
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div>
            <label className="label">Filter by Type:</label>
            <select
              value={
                (table.getColumn('type')?.getFilterValue() as string) ?? ''
              }
              onChange={(e) =>
                table
                  .getColumn('type')
                  ?.setFilterValue(e.target.value || undefined)
              }
              className="input w-auto"
            >
              <option value="">All Types</option>
              <option value="qualitative">Qualitative</option>
              <option value="quantitative">Quantitative</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center space-x-1 ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="flex flex-col">
                              <ChevronUpIcon
                                className={`h-3 w-3 ${
                                  header.column.getIsSorted() === 'asc'
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                                }`}
                              />
                              <ChevronDownIcon
                                className={`h-3 w-3 -mt-1 ${
                                  header.column.getIsSorted() === 'desc'
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                                }`}
                              />
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    data?.pagination.total || 0
                  )}
                </span>{' '}
                of{' '}
                <span className="font-medium">
                  {data?.pagination.total || 0}
                </span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Details Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Risk Assessment Details
                </h3>
                <button
                  onClick={() => setSelectedRisk(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Type</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedRisk.type}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRisk.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedRisk.type === 'qualitative' ? (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900">Asset Name</h4>
                      <p className="text-sm text-gray-600">
                        {(selectedRisk.input as any).assetName}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Threat Description
                      </h4>
                      <p className="text-sm text-gray-600">
                        {(selectedRisk.input as any).threatDescription}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Inherent Risk
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">
                          {(selectedRisk.output as any).inherentSeverity}
                        </span>
                        <RiskBadge
                          band={(selectedRisk.output as any).inherentBand}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Residual Risk
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">
                          {(selectedRisk.output as any).residualSeverity}
                        </span>
                        <RiskBadge
                          band={(selectedRisk.output as any).residualBand}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900">Asset Value</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency((selectedRisk.input as any).assetValue)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">SLE</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency((selectedRisk.output as any).sle)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        ALE (Inherent)
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(
                          (selectedRisk.output as any).aleInherent
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        ALE (Residual)
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(
                          (selectedRisk.output as any).aleResidual
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Net Risk</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency((selectedRisk.output as any).netRisk)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

