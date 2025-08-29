
import { Suspense } from 'react';
import { ProductCard } from "@/components/products/product-card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

async function getProducts(searchTerm: string, category: string): Promise<{ products: Product[], categories: string[] }> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(query(productsCol));
  let productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  const categories = [...new Set(productList.map(p => p.category).filter(Boolean) as string[])].sort();

  if (searchTerm) {
    productList = productList.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (category) {
      productList = productList.filter(product => product.category === category);
  }

  productList.sort((a, b) => {
    if (a.stock > 0 && b.stock === 0) return -1;
    if (a.stock === 0 && b.stock > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  return { products: productList, categories };
}

async function Filters({ initialSearch, initialCategory, categories }: { initialSearch: string, initialCategory: string, categories: string[] }) {
  return (
    <form className="mb-8 mx-auto max-w-lg flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            name="search"
            placeholder="Search by fabric name..."
            defaultValue={initialSearch}
            className="pl-10 w-full"
          />
        </div>
        <Select name="category" defaultValue={initialCategory}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <button type="submit" className="hidden">Submit</button>
    </form>
  )
}

async function ProductGrid({ searchTerm, category }: { searchTerm: string, category: string }) {
  const { products } = await getProducts(searchTerm, category);

  if (products.length === 0) {
    return <p className="text-center col-span-full">No products found matching your criteria.</p>;
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

async function BrowseContent({ searchTerm, category }: { searchTerm: string, category: string }) {
    const { categories } = await getProducts('', ''); // Fetch all categories
    return (
        <>
            <Filters initialSearch={searchTerm} initialCategory={category} categories={categories} />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Suspense fallback={<ProductGridSkeleton />} key={`${searchTerm}-${category}`}>
                    <ProductGrid searchTerm={searchTerm} category={category} />
                </Suspense>
            </div>
        </>
    );
}

export default function BrowsePage({ searchParams }: { searchParams: { search?: string, category?: string }}) {
  const searchTerm = searchParams.search || '';
  const category = searchParams.category === 'all' ? '' : searchParams.category || '';

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight">
            Our Fabric Collection
        </h1>
        <p className="text-muted-foreground mt-2">Browse through our curated selection of fine fabrics.</p>
      </div>
      <Suspense fallback={<p>Loading filters...</p>}>
        <BrowseContent searchTerm={searchTerm} category={category} />
      </Suspense>
    </div>
  );
}
