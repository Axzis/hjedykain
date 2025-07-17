
import { Suspense } from 'react';
import { ProductCard } from "@/components/products/product-card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';

async function getProducts(searchTerm: string): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(query(productsCol, orderBy("name")));
  let productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  if (searchTerm) {
    productList = productList.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return productList;
}

function SearchBar({ initialSearch }: { initialSearch: string }) {
  return (
     <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          name="search"
          placeholder="Search by fabric name..."
          defaultValue={initialSearch}
          className="pl-10 w-full"
        />
      </div>
  )
}

async function ProductGrid({ searchTerm }: { searchTerm: string }) {
  const products = await getProducts(searchTerm);

  if (products.length === 0) {
    return <p className="text-center col-span-full">No products found matching your search.</p>;
  }

  return (
    <>
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}

function ProductGridSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
         <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </>
  )
}


export default function BrowsePage({ searchParams }: { searchParams: { search?: string }}) {
  const searchTerm = searchParams.search || '';

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight">
            Our Fabric Collection
        </h1>
        <p className="text-muted-foreground mt-2">Browse through our curated selection of fine fabrics.</p>
      </div>
      <form className="mb-8 mx-auto max-w-lg">
          <SearchBar initialSearch={searchTerm} />
      </form>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchTerm={searchTerm} />
        </Suspense>
      </div>
    </div>
  );
}
