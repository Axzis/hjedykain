'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/lib/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'User name must be at least 2 characters.',
  }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  role: z.enum(['Admin', 'Cashier'], { required_error: 'You must select a role.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

interface UserFormProps {
  user?: User;
  onFormSubmit?: () => void;
}

export function UserForm({ user, onFormSubmit }: UserFormProps) {
  const { toast } = useToast()
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'Cashier',
      password: user?.password || '12345678',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      if (user) {
        // Update existing user
        const userRef = doc(db, "users", user.id);
        await setDoc(userRef, values, { merge: true });
      } else {
        // Add new user
        await addDoc(collection(db, "users"), values);
      }
      
      toast({
        title: `User ${user ? 'Updated' : 'Created'}`,
        description: `${values.name} has been saved successfully.`,
      });
      
      if (onFormSubmit) {
        onFormSubmit();
      }
      router.refresh();

    } catch (e) {
      console.error("Error saving user:", e);
      toast({
        title: `Error Saving User`,
        description: `There was an error saving ${values.name}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., user@example.com" {...field} />
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
                <Input type="password" {...field} />
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
                      <SelectValue placeholder="Select a role" />
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
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : `Save ${user ? 'Changes' : 'User'}`}
        </Button>
      </form>
    </Form>
  )
}
