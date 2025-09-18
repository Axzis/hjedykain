
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
import type { Sale } from '@/lib/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getCoreRowModel, useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, ColumnDef, SortingState, ColumnFiltersState, flexRender } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Download } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, where, startOfDay, endOfDay } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const getColumns = (isUserAdmin: boolean, router: ReturnType<typeof useRouter>): ColumnDef<Sale>[] => [
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

interface DataTableProps {
  data: Sale[];
  page: number;
  total: number;
  pageSize: number;
}

export function SalesHistoryTable({ data, page, total, pageSize }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);
  
  const isUserAdmin = pathname.startsWith('/admin');
  const pageCount = Math.ceil(total / pageSize);
  
  const [sorting, setSorting] = React.useState<SortingState>([])
  
  const [searchValue, setSearchValue] = React.useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  const columns = React.useMemo(() => getColumns(isUserAdmin, router), [isUserAdmin, router]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
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

  const handleExport = async () => {
    setIsExporting(true);
    toast({ title: "Preparing Export", description: "Fetching all sales data for the selected range..." });

    try {
        let fromDate: Date | null = null;
        let toDate: Date | null = null;

        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');
        const rangeParam = searchParams.get('range');

        if (fromParam && toParam) {
            fromDate = startOfDay(new Date(fromParam));
            toDate = endOfDay(new Date(toParam));
        } else {
            switch(rangeParam) {
                case 'today':
                    fromDate = startOfDay(new Date());
                    toDate = endOfDay(new Date());
                    break;
                case 'week':
                    fromDate = startOfWeek(new Date());
                    toDate = endOfWeek(new Date());
                    break;
                case 'month':
                    fromDate = startOfMonth(new Date());
                    toDate = endOfMonth(new Date());
                    break;
            }
        }


        const salesCol = collection(db, 'sales');
        let salesQuery = query(salesCol, orderBy('date', 'desc'));
        
        if (fromDate && toDate) {
          salesQuery = query(salesCol, 
            where('date', '>=', fromDate.toISOString()), 
            where('date', '<=', toDate.toISOString()),
            orderBy('date', 'desc')
          );
        }

        const querySnapshot = await getDocs(salesQuery);
        const allSales = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));

        if (allSales.length === 0) {
            toast({ title: "No Data", description: "No sales found in the selected date range to export.", variant: "destructive" });
            setIsExporting(false);
            return;
        }
        
        const csvHeader = "Sale ID,Date,Member,Total Items,Items Sold,Subtotal (Rp),Discount (Rp),Total (Rp),Cashier,Remark\n";
        const csvRows = allSales.map(sale => {
            const saleId = `SALE-${sale.id.slice(-6).toUpperCase()}`;
            const date = format(new Date(sale.date), 'yyyy-MM-dd HH:mm:ss');
            const memberName = sale.memberName || "N/A";
            const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            const itemsSold = `"${sale.items.map(i => `${i.quantity} of ${i.productName}`).join(', ')}"`;
            const remark = sale.remark ? `"${sale.remark.replace(/"/g, '""')}"` : "";

            return [
                saleId,
                date,
                memberName,
                totalItems,
                itemsSold,
                sale.subtotal,
                (sale.discount || 0),
                sale.total,
                sale.cashierId,
                remark
            ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "Export Successful", description: "Your sales history has been downloaded." });

    } catch (error) {
        console.error("Failed to export CSV:", error);
        toast({ title: "Export Failed", description: "Could not export the sales data. Please try again.", variant: "destructive" });
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input 
            placeholder="Filter by Member Name..." 
            className="max-w-sm" 
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
        />
        <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
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
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {total} results
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
