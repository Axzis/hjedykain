
'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from "@/components/products/product-card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useDebounce } from '@/hooks/use-debounce';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

async function getProducts(): Promise<{ products: Product[], categories: string[] }> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(query(productsCol));
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  const categories = [...new Set(productList.map(p => p.category).filter(Boolean) as string[])].sort();
  return { products: productList, categories };
}

export default function BrowsePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      const { products: productList, categories: categoryList } = await getProducts();
      setProducts(productList);
      setCategories(categoryList);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
    .filter(product => 
      selectedCategory === 'all' ? true : product.category === selectedCategory
    )
    .sort((a, b) => {
      if (a.stock > 0 && b.stock === 0) return -1;
      if (a.stock === 0 && b.stock > 0) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold tracking-tight">
            Our Fabric Collection
        </h1>
        <p className="text-muted-foreground mt-2">Browse through our curated selection of fine fabrics.</p>
      </div>
      <div className="mb-8 mx-auto max-w-lg flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by fabric name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
      </div>
      {loading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
