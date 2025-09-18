
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/types';
import { TableActions, ProductActions } from './products-data-table-actions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return category ? <Badge variant="secondary">{category}</Badge> : <span className="text-muted-foreground">N/A</span>;
    }
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
     cell: ({row}) => {
        const stock = row.getValue('stock');
        const unitName = row.original.unitName;
        return <span>{`${stock} ${unitName}`}</span>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;
      return <ProductActions product={product} />;
    },
  },
];

interface DataTableProps {
  data: Product[];
  page: number;
  total: number;
  pageSize: number;
}

export function ProductsDataTable({ data, page, total, pageSize }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageCount = total > 0 ? Math.ceil(total / pageSize) : 1;

  const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  const sort = searchParams.get('sort') || 'name';
  const order = searchParams.get('order') || 'asc';
  const sortValue = `${sort}-${order}`;
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
  });

  const updateQueryParam = (updates: { key: string; value: string | number | null }[]) => {
    const params = new URLSearchParams(searchParams.toString());
    updates.forEach(({ key, value }) => {
        if (value === null || value === '') {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);


  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-');
    updateQueryParam([
        { key: 'sort', value: sort },
        { key: 'order', value: order },
        { key: 'page', value: 1 }
    ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
            <Input 
              placeholder="Filter by product name..." 
              className="max-w-sm" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Select value={sortValue} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                    <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <TableActions />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
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
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {total} products.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  updateQueryParam([{ key: 'pageSize', value: Number(value) }, { key: 'page', value: 1 }]);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={`${pageSize}`} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </div>
          <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQueryParam([{ key: 'page', value: page - 1 }])}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQueryParam([{ key: 'page', value: page + 1 }])}
                disabled={page >= pageCount}
              >
                Next
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
