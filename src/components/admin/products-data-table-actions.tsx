'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ProductForm } from './product-form';
import { MoreHorizontal, PlusCircle, Download } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteDoc, doc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductImportDialog } from './product-import-dialog';
import { format } from 'date-fns';

export function AddProductDialog() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details for the new fabric. Click save to add it to the
            inventory.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4 -m-4">
          <ProductForm onFormSubmit={() => setIsAddDialogOpen(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function TableActions() {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        toast({ title: "Preparing Export", description: "Fetching all product data..." });

        try {
            const productsCol = collection(db, "products");
            const allProductsQuery = query(productsCol, orderBy("name"));
            const productSnapshot = await getDocs(allProductsQuery);
            const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

            if (productList.length === 0) {
                toast({ title: "No Data", description: "No products found to export.", variant: "destructive" });
                setIsExporting(false);
                return;
            }

            const csvHeader = "id,name,price,stock,description,properties,images\n";
            const csvRows = productList.map(p => {
                const id = p.id;
                const name = `"${(p.name || '').replace(/"/g, '""')}"`;
                const price = p.price;
                const stock = p.stock;
                const description = `"${(p.description || '').replace(/"/g, '""')}"`;
                const properties = `"${(p.properties || '').replace(/"/g, '""')}"`;
                const images = `"${(p.images || []).join(',')}"`;

                return [id, name, price, stock, description, properties, images].join(',');
            }).join('\n');

            const csvContent = csvHeader + csvRows;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-f8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `products_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast({ title: "Export Successful", description: "All product data has been downloaded." });

        } catch (error) {
            console.error("Failed to export products:", error);
            toast({ title: "Export Failed", description: "Could not export product data. Please try again.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export All'}
            </Button>
            <ProductImportDialog />
            <AddProductDialog />
        </div>
    )
}

export function ProductActions({ product }: { product: Product }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({
        title: 'Product Deleted',
        description: 'The product has been successfully deleted.',
      });
      router.refresh();
    } catch (e) {
      console.error('Error deleting product: ', e);
      toast({
        title: 'Error Deleting Product',
        description: 'There was an issue deleting the product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
     <AlertDialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem>Edit product</DropdownMenuItem>
            </DialogTrigger>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Delete product
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4 -m-4">
            <ProductForm
              product={product}
              onFormSubmit={() => setIsEditDialogOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
