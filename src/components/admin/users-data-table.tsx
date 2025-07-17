'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/types';
import { UsersDataTableContent } from './users-data-table-content';
import { AddUserDialog } from './users-data-table-actions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

interface DataTableProps {
  data: User[];
  page: number;
  total: number;
  pageSize: number;
}

export function UsersDataTable({ data, page, total, pageSize }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageCount = Math.ceil(total / pageSize);

  const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchValue, 500);

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
          placeholder="Filter by user name..." 
          className="max-w-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <AddUserDialog />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <UsersDataTableContent data={data} />
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
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
