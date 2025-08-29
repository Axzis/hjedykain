
'use client';
import * as React from 'react';
import {
  flexRender,
  Table as ReactTable,
} from '@tanstack/react-table';
import { TableRow, TableCell } from '@/components/ui/table';
import type { Product } from '@/lib/types';


export function ProductsDataTableContent({ table }: { table: ReactTable<Product> }) {
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
        No results.
      </TableCell>
    </TableRow>
  );
}
