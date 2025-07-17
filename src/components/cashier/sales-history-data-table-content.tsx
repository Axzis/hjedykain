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
import type { Sale } from '@/lib/types';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function SalesHistoryDataTableContent({ data }: { data: Sale[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per_page') ?? '10';

  const isUserAdmin = pathname.startsWith('/admin');

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: 'id',
      header: 'Sale ID',
      cell: ({ row }) => {
        const id = row.getValue('id') as string;
        return (
          <span className="font-mono text-xs">
            SALE-{id.slice(-6).toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return <span>{format(new Date(date), 'PPp')}</span>;
      },
    },
    {
      accessorKey: 'memberName',
      header: 'Member',
      cell: ({ row }) => {
        const memberName = row.getValue('memberName') as string;
        return memberName ? (
          memberName
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const items = row.original.items;
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
        return <Badge variant="secondary">{totalItems} item(s)</Badge>;
      },
    },
    {
      accessorKey: 'total',
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('total'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'cashierId',
      header: 'Cashier',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const sale = row.original;
        const invoicePath = isUserAdmin ? '/admin/invoice' : '/cashier/invoice';
  
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              params.set('saleId', sale.id);
              router.push(`${invoicePath}?${params.toString()}`);
            }}
          >
            View Invoice
          </Button>
        );
      },
    },
  ];

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
        No sales found.
      </TableCell>
    </TableRow>
  );
}
