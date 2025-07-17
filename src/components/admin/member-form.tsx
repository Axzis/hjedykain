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
import type { Member } from '@/lib/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, addDoc, collection } from 'firebase/firestore'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Member name must be at least 2 characters.',
  }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
})

interface MemberFormProps {
  member?: Member;
  onFormSubmit?: (newMember: Member) => void;
}

export function MemberForm({ member, onFormSubmit }: MemberFormProps) {
  const { toast } = useToast()
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || '',
      email: member?.email || '',
      phone: member?.phone || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      const joinDate = member?.joinDate || new Date().toISOString();
      const dataToSave = {
        ...values,
        joinDate,
      };

      let newMember: Member;

      if (member) {
        // Update existing member
        const memberRef = doc(db, "members", member.id);
        await setDoc(memberRef, dataToSave);
        newMember = { ...dataToSave, id: member.id };
      } else {
        // Add new member
        const docRef = await addDoc(collection(db, "members"), dataToSave);
        newMember = { ...dataToSave, id: docRef.id };
      }
      
      toast({
        title: `Member ${member ? 'Updated' : 'Created'}`,
        description: `${values.name} has been saved successfully.`,
      });
      
      if (onFormSubmit) {
        onFormSubmit(newMember);
      }
      router.refresh();

    } catch (e) {
      console.error("Error saving member:", e);
      toast({
        title: `Error Saving Member`,
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
                <Input placeholder="e.g., John Smith" {...field} />
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
                <Input type="email" placeholder="e.g., member@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : `Save ${member ? 'Changes' : 'Member'}`}
        </Button>
      </form>
    </Form>
  )
}
