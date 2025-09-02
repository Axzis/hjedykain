
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Unit } from '@/lib/types';
import { AddUnitDialog, UnitActions } from './unit-actions';
import { format } from 'date-fns';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
  } from '@tanstack/react-table';

const columns: ColumnDef<Unit>[] = [
    {
      accessorKey: 'name',
      header: 'Unit Name',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return <span>{format(new Date(date), 'PPP')}</span>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const unit = row.original;
        return <UnitActions unit={unit} />;
      },
    },
  ];


interface DataTableProps {
  data: Unit[];
}

export function UnitsDataTable({ data }: DataTableProps) {
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <h3 className="text-xl font-semibold">Master Unit</h3>
        <AddUnitDialog />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  No units found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
