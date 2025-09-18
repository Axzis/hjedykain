
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { products, users, members } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    setStatus('Memperbarui produk dengan kategori...');
    
    try {
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'products');
      const querySnapshot = await getDocs(productsCollection);
      
      let productsUpdated = 0;

      querySnapshot.forEach((document) => {
        const productData = document.data();
        // Hanya perbarui dokumen jika field 'category' tidak ada
        if (!productData.hasOwnProperty('category')) {
          const docRef = doc(db, 'products', document.id);
          batch.update(docRef, { category: 'N/A' });
          productsUpdated++;
        }
      });

      // Jika tidak ada produk untuk diperbarui, kita bisa menanam data awal.
      if (querySnapshot.empty) {
        setStatus('Database kosong. Menambahkan data awal...');
        // Seed products
        products.forEach((product) => {
            const docRef = doc(productsCollection, product.id);
            const { id, ...productData } = product;
            batch.set(docRef, productData);
        });

        // Seed users
        const usersCollection = collection(db, 'users');
        users.forEach((user) => {
            const docRef = doc(usersCollection, user.id);
            const { id, ...userData } = user;
            batch.set(docRef, userData);
        });

        // Seed members
        const membersCollection = collection(db, 'members');
        members.forEach((member) => {
            const docRef = doc(membersCollection, member.id);
            const { id, ...memberData } = member;
            batch.set(docRef, memberData);
        });
      }


      await batch.commit();

      let successMessage;
      if (querySnapshot.empty) {
        successMessage = `Berhasil menambahkan data awal: ${products.length} produk, ${users.length} pengguna, dan ${members.length} anggota.`;
      } else if (productsUpdated > 0) {
        successMessage = `Proses selesai. ${productsUpdated} produk telah diperbarui dengan field kategori.`;
      } else {
        successMessage = 'Semua produk sudah memiliki field kategori. Tidak ada yang perlu diperbarui.';
      }

      setStatus(successMessage);
      toast({
        title: 'Proses Selesai',
        description: successMessage,
      });

    } catch (error) {
      console.error('Error seeding database:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus(`Error: ${errorMessage}`);
      toast({
        title: 'Proses Gagal',
        description: `Tidak dapat memproses database. Lihat konsol untuk detail.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Manajemen Database</CardTitle>
          <CardDescription>
            Gunakan tombol di bawah untuk mengisi database awal atau memperbarui skema data dengan aman.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Operasi Aman</AlertTitle>
              <AlertDescription>
                Proses ini akan memeriksa produk Anda. Jika ada produk yang belum memiliki field 'category', maka field tersebut akan ditambahkan dengan nilai 'N/A' tanpa mengubah data lainnya. Data Anda yang sudah ada aman.
              </AlertDescription>
            </Alert>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? 'Memproses...' : 'Isi/Perbarui Database Dengan Aman'}
          </Button>
          {status && <p className="text-sm text-muted-foreground mt-2 text-center">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
