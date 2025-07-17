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
import type { Product } from '@/lib/types'
import { generateProductDescription } from '@/ai/flows/generate-product-description'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, addDoc, collection } from 'firebase/firestore'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative.' }),
  properties: z.string().min(10, { message: "Please list key properties."}),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      properties: product?.properties || '',
      description: product?.description || '',
      images: product?.images && product.images.length > 0 ? [...product.images, ...Array(5 - product.images.length).fill('https://placehold.co/600x400.png')].slice(0,5) : defaultPlaceholders,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    const dataToSave = { ...values, images: values.images.filter(img => img.trim() !== '' && img.trim() !== 'https://placehold.co/600x400.png') };
    if (dataToSave.images.length === 0) {
      dataToSave.images.push('https://placehold.co/600x400.png');
    }


    try {
      if (product) {
        // Update existing product
        const productRef = doc(db, "products", product.id);
        await setDoc(productRef, dataToSave);
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

  async function handleGenerateDescription() {
    setIsGenerating(true);
    const name = form.getValues('name');
    const properties = form.getValues('properties');

    if (!name || !properties) {
        toast({
            title: "Missing Information",
            description: "Please provide a name and key properties to generate a description.",
            variant: "destructive"
        })
        setIsGenerating(false);
        return;
    }

    try {
        const result = await generateProductDescription({
            fabricName: name,
            keyProperties: properties,
        })
        if(result.description) {
            form.setValue('description', result.description);
            toast({
                title: "Description Generated!",
                description: "The AI-powered description has been added."
            })
        }
    } catch(e) {
        console.error(e);
        toast({
            title: "Generation Failed",
            description: "Could not generate a description at this time.",
            variant: "destructive"
        })
    } finally {
        setIsGenerating(false);
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
                <FormLabel>Price (per yard)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stock (yards)</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="properties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Properties</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 100% Silk, 19mm weight, 45 inch width..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Used to generate the product description.
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
              <FormLabel className="flex justify-between items-center">
                Description
                <Button type="button" size="sm" variant="outline" onClick={handleGenerateDescription} disabled={isGenerating || isSaving}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </FormLabel>
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


        <Button type="submit" disabled={isSaving || isGenerating}>
          {isSaving ? 'Saving...' : `Save ${product ? 'Changes' : 'Product'}`}
        </Button>
      </form>
    </Form>
  )
}
