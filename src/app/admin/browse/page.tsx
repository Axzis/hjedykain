'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from "@/components/products/product-card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useDebounce } from '@/hooks/use-debounce';

async function getProducts(searchTerm: string): Promise<Product[]> {
  const productsCol = collection(db, "products");
  let productQuery = query(productsCol, orderBy("name"));

  // Firestore does not support case-insensitive search natively.
  // A common workaround is to store a lowercase version of the field.
  // Since we don't have that, we'll filter client-side after a basic query.
  // For a more scalable solution, a dedicated search service like Algolia or Typesense would be best.

  const productSnapshot = await getDocs(productQuery);
  let productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  
  if (searchTerm) {
    productList = productList.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return productList;
}

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      const productList = await getProducts(debouncedSearchTerm);
      setProducts(productList);
      setLoading(false);
    };
    fetchProducts();
  }, [debouncedSearchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight">
            Our Fabric Collection
        </h1>
        <p className="text-muted-foreground mt-2">Browse through our curated selection of fine fabrics.</p>
      </div>
      <div className="mb-8 mx-auto max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by fabric name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
      </div>
      {loading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
