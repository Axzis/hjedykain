
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
    setStatus('Checking products and updating schema if needed...');
    
    try {
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'products');
      const querySnapshot = await getDocs(productsCollection);
      
      let productsUpdated = 0;

      // Scenario 1: Database has products, check and update schema
      if (!querySnapshot.empty) {
        querySnapshot.forEach((document) => {
          const productData = document.data();
          const updateData: { category?: string; unitName?: string } = {};
          if (!productData.hasOwnProperty('category')) {
            updateData.category = 'N/A';
          }
          if (!productData.hasOwnProperty('unitName')) {
            updateData.unitName = 'yard';
          }

          if (Object.keys(updateData).length > 0) {
            const docRef = doc(db, 'products', document.id);
            batch.update(docRef, updateData);
            productsUpdated++;
          }
        });
      } else {
        // Scenario 2: Database is empty, perform initial seeding
        setStatus('Database is empty. Adding initial data...');
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
        successMessage = `Successfully seeded initial data: ${products.length} products, ${users.length} users, and ${members.length} members.`;
      } else if (productsUpdated > 0) {
        successMessage = `Operation complete. ${productsUpdated} existing products have been safely updated with default fields.`;
      } else {
        successMessage = 'All existing products already have the required fields. No updates were needed.';
      }

      setStatus(successMessage);
      toast({
        title: 'Operation Successful',
        description: successMessage,
      });

    } catch (error) {
      console.error('Error processing database:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus(`Error: ${errorMessage}`);
      toast({
        title: 'Operation Failed',
        description: `Could not process the database. See console for details.`,
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
          <CardTitle className="font-headline text-2xl">Database Management</CardTitle>
          <CardDescription>
            Use the button below to safely populate or update your database schema.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Safe Operation</AlertTitle>
              <AlertDescription>
                This process will check your existing products. If a product is missing 'category' or 'unitName', it will be added with default values ('N/A' and 'yard') without changing other data. Your existing data is safe.
              </AlertDescription>
            </Alert>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? 'Processing...' : 'Safely Seed / Update Database'}
          </Button>
          {status && <p className="text-sm text-muted-foreground mt-2 text-center">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
