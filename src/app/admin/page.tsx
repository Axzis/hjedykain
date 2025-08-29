
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, ShoppingCart, Contact } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getCountFromServer, query, where, Timestamp } from "firebase/firestore";
import type { Sale } from "@/lib/types";
import { DashboardFilters } from "@/components/admin/dashboard-filters";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, sub } from 'date-fns';

type SearchParams = {
  from?: string;
  to?: string;
  range?: string;
}

async function getDashboardData(searchParams: SearchParams) {
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (searchParams.from && searchParams.to) {
    fromDate = new Date(searchParams.from);
    toDate = new Date(searchParams.to);
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

  // Base queries
  const salesCol = collection(db, "sales");
  const membersCol = collection(db, "members");

  let salesQuery = fromDate && toDate ? query(salesCol, where("date", ">=", fromDate.toISOString()), where("date", "<=", toDate.toISOString())) : query(salesCol);
  let membersQuery = fromDate && toDate ? query(membersCol, where("joinDate", ">=", fromDate.toISOString()), where("joinDate", "<=", toDate.toISOString())) : query(membersCol);
  
  // Get sales data
  const salesSnapshot = await getDocs(salesQuery);
  const salesList = salesSnapshot.docs.map(doc => doc.data() as Sale);
  
  const totalRevenue = salesList.reduce((acc, sale) => acc + sale.total, 0);
  const totalSales = salesList.length;

  // Get products count (always all-time)
  const productsCol = collection(db, "products");
  const productsSnapshot = await getCountFromServer(productsCol);
  const activeProducts = productsSnapshot.data().count;

  // Get new members count for the period
  const newMembersSnapshot = await getCountFromServer(membersQuery);
  const newMembers = newMembersSnapshot.data().count;

  return { totalRevenue, totalSales, activeProducts, newMembers };
}


export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  const { totalRevenue, totalSales, activeProducts, newMembers } = await getDashboardData(searchParams);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard Overview</h2>
        <div className="flex justify-end">
          <DashboardFilters />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{totalRevenue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">
              Revenue for the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Transactions in the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Total products in inventory (all-time)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newMembers}</div>
            <p className="text-xs text-muted-foreground">
              New members in the selected period
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Activity feed coming soon...</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
