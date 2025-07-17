
import { ProductsDataTable } from "@/components/admin/products-data-table";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const PAGE_SIZE = 10;

async function getProducts(page: number = 1, search: string = ''): Promise<{products: Product[], total: number}> {
  const productsCol = collection(db, "products");
  
  const allProductsQuery = query(productsCol, orderBy("name"));
  const productSnapshot = await getDocs(allProductsQuery);
  let productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  if (search) {
      const searchLower = search.toLowerCase();
      productList = productList.filter(product => product.name.toLowerCase().includes(searchLower));
  }
  
  const total = productList.length;

  const paginatedProducts = productList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { products: paginatedProducts, total };
}

export default async function AdminProductsPage({ searchParams }: { searchParams: { page?: string, search?: string } }) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || '';
    const { products, total } = await getProducts(page, search);
  
    return (
      <div className="container mx-auto py-2">
        <ProductsDataTable data={products} page={page} total={total} pageSize={PAGE_SIZE}/>
      </div>
    )
  }
