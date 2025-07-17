'use client';
import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';
import { TableRow, TableCell } from '@/components/ui/table';
import type { Member } from '@/lib/types';
import { MemberActions } from './members-data-table-actions';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

const getColumns = (): ColumnDef<Member>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'joinDate',
    header: 'Join Date',
    cell: ({ row }) => {
      const date = row.getValue('joinDate') as string;
      return <span>{format(new Date(date), 'PPP')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const member = row.original;
      return <MemberActions member={member} />;
    },
  },
];

export function MembersDataTableContent({ data }: { data: Member[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per_page') ?? '10';

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const columns = React.useMemo(() => getColumns(), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: parseInt(page) - 1,
        pageSize: parseInt(perPage),
      },
    },
  });

  return table.getRowModel().rows?.length ? (
    table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        No results.
      </TableCell>
    </TableRow>
  );
}
