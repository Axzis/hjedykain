
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/common/logo';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  role: z.enum(['Admin', 'Cashier'], { required_error: 'You must select a role.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSeedMessage, setShowSeedMessage] = useState(false);
  const [isCheckingDb, setIsCheckingDb] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkDb = async () => {
      const usersRef = collection(db, 'users');
      const countSnapshot = await getCountFromServer(usersRef);
      if (countSnapshot.data().count === 0) {
        setShowSeedMessage(true);
      }
      setIsCheckingDb(false);
    }
    checkDb();
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (showSeedMessage) {
        toast({
          title: 'Database Empty!',
          description: "Please seed the database first.",
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

    try {
      const usersRef = collection(db, 'users');
      
      const q = query(usersRef, where('email', '==', values.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: 'Login Failed',
          description: 'No account found with that email address.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;

      if (!userData.password) {
        toast({
          title: 'Login Failed',
          description: 'Account has no password set. Please contact an administrator.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      if (userData.password !== values.password) {
        toast({
         title: 'Login Failed',
         description: 'Incorrect password. Please try again.',
         variant: 'destructive',
       });
       setIsSubmitting(false);
       return;
     }

      if (userData.role !== values.role) {
         toast({
          title: 'Login Failed',
          description: `The selected role '${values.role}' does not match the account's role.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: 'Login Successful',
        description: `Welcome, ${userData.name}! Redirecting to your dashboard...`,
      });

      if (userData.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/cashier');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="font-headline text-2xl">Staff Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {showSeedMessage && (
            <Alert className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Database Empty!</AlertTitle>
              <AlertDescription>
                No users found. Please{' '}
                <Link href="/seed-db" className="font-bold underline">
                  seed the database
                </Link>{' '}
                first to create default accounts.
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@stitchpos.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role to log in as" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || isCheckingDb}>
                {isCheckingDb ? 'Checking database...' : (isSubmitting ? 'Logging in...' : 'Login')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
