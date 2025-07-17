
'use client';
import * as React from 'react';
import {
  flexRender,
  Table as ReactTable,
} from '@tanstack/react-table';
import { TableRow, TableCell } from '@/components/ui/table';
import type { Sale } from '@/lib/types';

export function SalesHistoryDataTableContent({ table }: { table: ReactTable<Sale> }) {
  
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
      <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
        No sales found.
      </TableCell>
    </TableRow>
  );
}
