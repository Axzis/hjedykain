
import { SalesHistoryTable } from "@/components/cashier/sales-history-table";
import { db } from "@/lib/firebase";
import { Sale } from "@/lib/types";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { HistoryFilters } from "@/components/shared/history-filters";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const PAGE_SIZE = 10;

type SearchParams = {
  page?: string;
  search?: string;
  from?: string;
  to?: string;
  range?: string;
}

async function getSales(searchParams: SearchParams): Promise<{sales: Sale[], total: number}> {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  
  const salesCol = collection(db, "sales");
  let salesQuery = query(salesCol, orderBy("date", "desc"));
  
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (searchParams.from && searchParams.to) {
    fromDate = startOfDay(new Date(searchParams.from));
    toDate = endOfDay(new Date(searchParams.to));
  } else {
    switch(searchParams.range) {
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
      default:
        // All time
        break;
    }
  }

  if (fromDate && toDate) {
    salesQuery = query(salesCol, 
      orderBy("date", "desc"),
      where("date", ">=", fromDate.toISOString()), 
      where("date", "<=", toDate.toISOString())
    );
  }

  const salesSnapshot = await getDocs(salesQuery);
  let salesList = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));

  if (search) {
      const searchLower = search.toLowerCase();
      salesList = salesList.filter(sale => sale.memberName?.toLowerCase().includes(searchLower));
  }
  
  const total = salesList.length;

  const paginatedSales = salesList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { sales: paginatedSales, total };
}

export default async function AdminSalesHistoryPage({ searchParams }: { searchParams: SearchParams }) {
    const page = Number(searchParams.page) || 1;
    const { sales, total } = await getSales(searchParams);
  
    return (
      <div className="container mx-auto py-2">
        <div className="flex flex-col gap-4 mb-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Sales History</h2>
            <div className="flex justify-end">
                <HistoryFilters />
            </div>
        </div>
        <SalesHistoryTable data={sales} page={page} total={total} pageSize={PAGE_SIZE} />
      </div>
    )
  }
