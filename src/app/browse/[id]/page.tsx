
import { notFound } from 'next/navigation';
import type { Product } from '@/lib/types';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProductDetailView from '@/components/products/product-detail-view';

async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
        return null;
    }
}


export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
