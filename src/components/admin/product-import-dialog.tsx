'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

const REQUIRED_HEADERS = ['name', 'price', 'stock'];
const OPTIONAL_HEADERS = ['description', 'thumbnail_image_link', 'example_image_link'];
const ALL_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

export function ProductImportDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    setIsUploading(true);
    setError(null);

    const fileText = await file.text();
    const rows = fileText.split('\n').map(row => row.trim()).filter(row => row);
    if (rows.length < 2) {
      setError('CSV file must contain a header row and at least one data row.');
      setIsUploading(false);
      return;
    }

    const header = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const dataRows = rows.slice(1);

    const missingHeaders = REQUIRED_HEADERS.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
      setError(`Missing required headers: ${missingHeaders.join(', ')}.`);
      setIsUploading(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'products');
      let productsAdded = 0;

      dataRows.forEach((row, index) => {
        const values = row.split(',');
        const productData: any = {};
        
        header.forEach((h, i) => {
          if (ALL_HEADERS.includes(h)) {
             productData[h] = values[i]?.trim() || '';
          }
        });
        
        const name = productData.name;
        const price = parseFloat(productData.price);
        const stock = parseInt(productData.stock, 10);
        
        if (!name || isNaN(price) || isNaN(stock)) {
          console.warn(`Skipping invalid row ${index + 2}: Name, price, and stock are required and must be valid.`);
          return;
        }
        
        const newDocRef = doc(productsCollection);
        batch.set(newDocRef, {
            name: name,
            price: price,
            stock: stock,
            description: productData.description || `Description for ${name}`,
            properties: productData.properties || '',
            images: [
                productData.thumbnail_image_link || 'https://placehold.co/600x400.png',
                productData.example_image_link || 'https://placehold.co/600x400.png',
            ].filter(img => img.trim() !== ''),
        });
        productsAdded++;
      });
        
      if (productsAdded === 0) {
        setError('No valid product rows found to import.');
        setIsUploading(false);
        return;
      }

      await batch.commit();

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${productsAdded} products.`,
      });

      setIsOpen(false);
      setFile(null);
      router.refresh();

    } catch (e) {
      console.error('Error importing products:', e);
      setError('An error occurred during the import process. Please check the console.');
      toast({
        title: 'Import Failed',
        description: 'Could not import products. Please check the CSV file and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple products at once.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>CSV Format</AlertTitle>
                <AlertDescription>
                    Your CSV must have a header row with the following columns: <strong>name, price, stock</strong>.
                    <br/>Optional columns: <strong>description, thumbnail_image_link, example_image_link</strong>.
                </AlertDescription>
            </Alert>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={isUploading || !file}>
            {isUploading ? 'Importing...' : 'Import Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
