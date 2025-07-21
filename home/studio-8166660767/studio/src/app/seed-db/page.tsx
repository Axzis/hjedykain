'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { products, users, members, units } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    setStatus('Seeding units, products, users, and members...');
    
    try {
      const batch = writeBatch(db);

      // Seed units
      const unitsCollection = collection(db, 'units');
      units.forEach((unit) => {
          const docRef = doc(unitsCollection, unit.id);
          const { id, ...unitData } = unit;
          batch.set(docRef, { ...unitData, createdAt: new Date().toISOString()});
      });
      
      // Seed products
      const productsCollection = collection(db, 'products');
      products.forEach((product) => {
        const docRef = doc(productsCollection);
        batch.set(docRef, product);
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

      await batch.commit();

      const successMessage = `Successfully seeded ${units.length} units, ${products.length} products, ${users.length} users, and ${members.length} members.`;
      setStatus(successMessage);
      toast({
        title: 'Database Seeded',
        description: successMessage,
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus(`Error seeding database: ${errorMessage}`);
      toast({
        title: 'Seeding Failed',
        description: `Could not seed the database. Check the console for details.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Seed Firestore Database</CardTitle>
          <CardDescription>
            Click the button below to populate your collections in Firestore with initial dummy data. This only needs to be done once.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleSeed} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? 'Seeding...' : 'Seed Database'}
          </Button>
          {status && <p className="text-sm text-muted-foreground mt-2">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
