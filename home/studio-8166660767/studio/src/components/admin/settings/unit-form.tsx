
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
import type { Unit } from '@/lib/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, addDoc, collection } from 'firebase/firestore'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Unit name is required.',
  }),
})

interface UnitFormProps {
  unit?: Unit;
  onFormSubmit?: () => void;
}

export function UnitForm({ unit, onFormSubmit }: UnitFormProps) {
  const { toast } = useToast()
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: unit?.name || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      const dataToSave = {
        name: values.name,
        createdAt: unit?.createdAt || new Date().toISOString(),
      };

      if (unit) {
        // Update existing unit
        const unitRef = doc(db, "units", unit.id);
        await setDoc(unitRef, dataToSave, { merge: true });
      } else {
        // Add new unit
        await addDoc(collection(db, "units"), dataToSave);
      }
      
      toast({
        title: `Unit ${unit ? 'Updated' : 'Created'}`,
        description: `${values.name} has been saved successfully.`,
      });
      
      if (onFormSubmit) {
        onFormSubmit();
      }
      router.refresh();

    } catch (e) {
      console.error("Error saving unit:", e);
      toast({
        title: `Error Saving Unit`,
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
              <FormLabel>Unit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., meter, pcs, roll" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : `Save ${unit ? 'Changes' : 'Unit'}`}
        </Button>
      </form>
    </Form>
  )
}
