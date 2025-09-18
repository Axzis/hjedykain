
import { Suspense } from 'react';
import { ProductCard } from "@/components/products/product-card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

async function getProductsAndCategories(): Promise<{ products: Product[], categories: string[] }> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(query(productsCol));
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  const categories = [...new Set(productList.map(p => p.category).filter(Boolean) as string[])].sort();
  return { products: productList, categories };
}

function Filters({ initialSearch, initialCategory, categories }: { initialSearch: string, initialCategory: string, categories: string[] }) {
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
        <Select name="category" defaultValue={initialCategory || 'all'}>
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
        <Button type="submit">Filter</Button>
    </form>
  )
}

function ProductGridSkeleton() {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
           <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

async function BrowseContent({ searchTerm, category }: { searchTerm: string, category: string }) {
    const { products, categories } = await getProductsAndCategories();

    const filteredProducts = products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product => 
        !category || category === 'all' ? true : product.category === category
      )
      .sort((a, b) => {
        if (a.stock > 0 && b.stock === 0) return -1;
        if (a.stock === 0 && b.stock > 0) return 1;
        return a.name.localeCompare(b.name);
      });

    return (
        <>
            <Filters initialSearch={searchTerm} initialCategory={category} categories={categories} />
             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p className="text-center col-span-full">No products found matching your criteria.</p>
                )}
            </div>
        </>
    );
}

export default function AdminBrowsePage({ searchParams }: { searchParams: { search?: string, category?: string }}) {
  const searchTerm = searchParams.search || '';
  const category = searchParams.category || '';

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight">
            Our Fabric Collection
        </h1>
        <p className="text-muted-foreground mt-2">Browse through our curated selection of fine fabrics.</p>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <BrowseContent searchTerm={searchTerm} category={category} />
      </Suspense>
    </div>
  );
}
