
import { ProductsDataTable } from "@/components/admin/products-data-table";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { collection, getDocs, query, orderBy, OrderByDirection } from "firebase/firestore";

async function getProducts(
    page: number = 1, 
    search: string = '', 
    pageSize: number = 10,
    sort: string = 'name',
    order: OrderByDirection = 'asc'
): Promise<{products: Product[], total: number}> {
  const productsCol = collection(db, "products");
  
  // The orderBy in Firestore requires an exact match for filtering, which is tricky with text search.
  // So we fetch all, then filter and sort in code. This is less efficient for very large datasets
  // but provides the necessary flexibility for a case-insensitive search.
  const allProductsQuery = query(productsCol, orderBy(sort, order));
  const productSnapshot = await getDocs(allProductsQuery);
  let productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  // Case-insensitive search filter
  if (search) {
      const searchLower = search.toLowerCase();
      productList = productList.filter(product => product.name.toLowerCase().includes(searchLower));
  }
  
  const total = productList.length;

  const paginatedProducts = productList.slice((page - 1) * pageSize, page * pageSize);

  return { products: paginatedProducts, total };
}

export default async function AdminProductsPage({ 
    searchParams 
}: { 
    searchParams: { 
        page?: string, 
        search?: string, 
        pageSize?: string,
        sort?: string,
        order?: string,
    } 
}) {
    const page = Number(searchParams.page) || 1;
    const pageSize = Number(searchParams.pageSize) || 10;
    const search = searchParams.search || '';
    const sort = searchParams.sort || 'name';
    const order = searchParams.order as OrderByDirection || 'asc';
    const { products, total } = await getProducts(page, search, pageSize, sort, order);
  
    return (
      <div className="container mx-auto py-2">
        <ProductsDataTable data={products} page={page} total={total} pageSize={pageSize}/>
      </div>
    )
  }
