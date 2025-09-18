
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, addDoc, collection } from 'firebase/firestore'
import { uploadImage } from '@/app/actions/upload-actions'
import { Loader2, Upload } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  category: z.string().optional(),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative.' }),
  unitName: z.string().min(1, { message: 'Unit name is required.' }),
  properties: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url({ message: "Please enter a valid URL." }).or(z.literal(''))).optional(),
})

interface ProductFormProps {
  product?: Product;
  onFormSubmit?: () => void;
}

export function ProductForm({ product, onFormSubmit }: ProductFormProps) {
  const { toast } = useToast()
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const defaultImages = Array(5).fill('');
  if (product?.images) {
    product.images.forEach((img, i) => {
        if (i < 5) defaultImages[i] = img;
    });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      category: product?.category || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      unitName: product?.unitName || 'yard',
      properties: product?.properties || '',
      description: product?.description || '',
      images: defaultImages,
    },
  })
  
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "images"
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    const imageValues = values.images?.filter(img => img && img.trim() !== '') ?? [];

    const dataToSave = { 
        ...values
    };
    dataToSave.images = imageValues;

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadImage(formData);
      if (result.url) {
        update(index, result.url);
        toast({
          title: "Upload Successful",
          description: "Image has been uploaded and URL is set.",
        })
      } else {
        throw new Error(result.error || "Unknown upload error");
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingIndex(null);
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
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Silk, Denim, Cotton" {...field} />
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
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="grid grid-cols-2 gap-2">
                 <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="unitName"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., yard" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
        
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
           <FormLabel>Product Images (Optional)</FormLabel>
            {fields.map((field, index) => (
                <FormField
                key={field.id}
                control={form.control}
                name={`images.${index}`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm text-muted-foreground">
                            {index === 0 ? 'Thumbnail Image' : `Example Image ${index}`}
                        </FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input placeholder="https://... or upload" {...field} />
                            </FormControl>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={uploadingIndex === index}
                                onClick={() => fileInputRefs.current[index]?.click()}
                            >
                                {uploadingIndex === index ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Upload />
                                )}
                                <span className="sr-only">Upload Image</span>
                            </Button>
                            <input
                                type="file"
                                ref={el => (fileInputRefs.current[index] = el)}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={(e) => handleFileChange(e, index)}
                            />
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
            ))}
            <FormDescription>
                Provide URLs for product images or upload them. If all are left blank, a default image will be used.
            </FormDescription>
        </div>


        <Button type="submit" disabled={isSaving || uploadingIndex !== null}>
          {isSaving ? 'Saving...' : (uploadingIndex !== null ? 'Uploading...' : `Save ${product ? 'Changes' : 'Product'}`)}
        </Button>
      </form>
    </Form>
  )
}
