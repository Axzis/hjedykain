
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { Product, Unit } from '@/lib/types'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative.' }),
  unitId: z.string().min(1, { message: "Please select a unit." }),
  properties: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url({ message: "Please enter a valid image URL." })).min(1, {message: 'At least one image is required.'}).max(5),
})

interface ProductFormProps {
  product?: Product;
  onFormSubmit?: () => void;
}

const defaultPlaceholders = Array(5).fill('https://placehold.co/600x400.png');

export function ProductForm({ product, onFormSubmit }: ProductFormProps) {
  const { toast } = useToast()
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    async function fetchUnits() {
        const unitsCol = collection(db, 'units');
        const q = query(unitsCol, orderBy('name'));
        const unitsSnapshot = await getDocs(q);
        const unitsList = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        setUnits(unitsList);
    }
    fetchUnits();
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      unitId: product?.unitId || '',
      properties: product?.properties || '',
      description: product?.description || '',
      images: product?.images && product.images.length > 0 ? [...product.images, ...Array(5 - product.images.length).fill('https://placehold.co/600x400.png')].slice(0,5) : defaultPlaceholders,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    const selectedUnit = units.find(u => u.id === values.unitId);
    if (!selectedUnit) {
        toast({ title: 'Error', description: 'Selected unit not found.', variant: 'destructive' });
        setIsSaving(false);
        return;
    }

    const dataToSave = { 
        ...values,
        unitName: selectedUnit.name,
        images: values.images.filter(img => img.trim() !== '' && img.trim() !== 'https://placehold.co/600x400.png') 
    };

    if (dataToSave.images.length === 0) {
      dataToSave.images.push('https://placehold.co/600x400.png');
    }

    try {
      if (product) {
        // Update existing product
        const productRef = doc(db, "products", product.id);
        await setDoc(productRef, dataToSave, { merge: true });
      } else {
        // Add new product
        await addDoc(collection(db, "products"), dataToSave);
      }
      
      toast({
        title: `Product ${product ? 'Updated' : 'Created'}`,
        description: `${values.name} has been saved successfully.`,
      });
      
      if (onFormSubmit) {
        onFormSubmit();
      }
      router.refresh();

    } catch (e) {
      console.error("Error saving product:", e);
      toast({
        title: `Error Saving Product`,
        description: `There was an error saving ${values.name}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  const selectedUnitName = units.find(u => u.id === form.watch('unitId'))?.name || 'unit';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Royal Blue Silk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (per {selectedUnitName})</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.length === 0 && <SelectItem value="loading" disabled>Loading units...</SelectItem>}
                        {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
        </div>
        <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stock ({selectedUnitName})</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
          control={form.control}
          name="properties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Properties</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 100% Sutra, berat 19mm, lebar 114 cm..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief details about the fabric.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A luxurious silk with a beautiful sheen..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4 rounded-md border p-4">
           <FormLabel>Product Images</FormLabel>
           <FormField
            control={form.control}
            name="images.0"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Thumbnail Image URL</FormLabel>
                <FormControl>
                    <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <FormField
                key={i}
                control={form.control}
                name={`images.${i}` as const}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">{`Example Image ${i}`}</FormLabel>
                    <FormControl>
                        <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            ))}
            </div>
            <FormDescription>
                Provide one main thumbnail and up to four example images.
            </FormDescription>
        </div>


        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : `Save ${product ? 'Changes' : 'Product'}`}
        </Button>
      </form>
    </Form>
  )
}
