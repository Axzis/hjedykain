
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
import { Input } from '@/components/ui/input';
import type { Member } from '@/lib/types';
import { AddMemberDialog, MemberActions } from './members-data-table-actions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { format } from 'date-fns';

const columns: ColumnDef<Member>[] = [
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

interface DataTableProps {
  data: Member[];
  page: number;
  total: number;
  pageSize: number;
}

export function MembersDataTable({ data, page, total, pageSize }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageCount = Math.ceil(total / pageSize);

  const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
        pagination: {
            pageIndex: page -1,
            pageSize,
        }
    }
  });

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, router, pathname, searchParams]);


  const handlePreviousPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page - 1));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleNextPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page + 1));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input 
            placeholder="Filter by name..." 
            className="max-w-sm" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
        />
        <AddMemberDialog />
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {total} members.
        </div>
        <div className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </div>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page <= 1}>
            Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= pageCount}>
            Next
            </Button>
        </div>
      </div>
    </div>
  );
}
