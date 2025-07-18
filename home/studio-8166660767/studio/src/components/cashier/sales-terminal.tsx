
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, SaleItem, Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, User as UserIcon, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { cn } from '@/lib/utils';

function QuantityDialog({
  product,
  isOpen,
  onClose,
  onConfirm,
  initialQuantity = 1,
  isEditing = false,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  initialQuantity?: number;
  isEditing?: boolean;
}) {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialQuantity]);

  if (!product) return null;

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(quantity);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Enter the quantity you want to add to the cart. Available stock: {product.stock} meters.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="quantity">Quantity (meters)</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            min="0.1"
            step="0.1"
            max={product.stock}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>{isEditing ? 'Update Quantity' : 'Add to Cart'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SalesTerminalProps {
    allProducts: Product[];
    allMembers: Member[];
}

export default function SalesTerminal({ allProducts, allMembers }: SalesTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberPopoverOpen, setIsMemberPopoverOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  
  const [editingCartItem, setEditingCartItem] = useState<SaleItem | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) {
       toast({
            title: "Out of Stock",
            description: `${product.name} is currently out of stock.`,
            variant: "destructive"
        })
        return;
    }
    setSelectedProduct(product);
    setIsQuantityDialogOpen(true);
  };
  
  const addToCart = (quantity: number) => {
    if (!selectedProduct) return;
    
    if (quantity > selectedProduct.stock) {
        toast({
            title: "Stock limit reached",
            description: `Only ${selectedProduct.stock} meters of ${selectedProduct.name} available.`,
            variant: "destructive"
        });
        return;
    }

    const existingItemIndex = cart.findIndex((item) => item.productId === selectedProduct.id);

    if (existingItemIndex > -1) {
      const newCart = [...cart];
      const newQuantity = newCart[existingItemIndex].quantity + quantity;
      if (newQuantity > selectedProduct.stock) {
         toast({
            title: "Stock limit reached",
            description: `Cannot add more ${selectedProduct.name}. Total would exceed stock.`,
            variant: "destructive"
        });
        return;
      }
      newCart[existingItemIndex].quantity = newQuantity;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: quantity,
          price: selectedProduct.price,
        },
      ]);
    }
  };

  const handleEditCartItem = (item: SaleItem) => {
    const product = allProducts.find(p => p.id === item.productId);
    if(product) {
      setSelectedProduct(product);
      setEditingCartItem(item);
      setIsQuantityDialogOpen(true);
    }
  };

  const updateCartItemQuantity = (newQuantity: number) => {
    if (!editingCartItem || !selectedProduct) return;

    if (newQuantity <= 0) {
      removeFromCart(editingCartItem.productId);
    } else if (newQuantity > selectedProduct.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${selectedProduct.stock} meters of ${selectedProduct.name} available.`,
        variant: "destructive"
      });
      return;
    } else {
      const newCart = cart.map(item => 
        item.productId === editingCartItem.productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(newCart);
    }

    setEditingCartItem(null);
  };

  const handleDialogClose = () => {
    setIsQuantityDialogOpen(false);
    setSelectedProduct(null);
    setEditingCartItem(null);
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };
  
  const { subtotal, totalItems, finalTotal } = useMemo(() => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const finalTotal = subtotal - discount;
    return { subtotal, totalItems, finalTotal };
  }, [cart, discount]);


  const handleCompleteSale = async () => {
    const finalCart = cart.filter(item => item.quantity > 0);
    if (finalCart.length === 0) {
        toast({
            title: "Cart is empty",
            description: "Please add products to the cart.",
            variant: "destructive"
        })
        return;
    }
    
    for (const item of finalCart) {
      const product = allProducts.find(p => p.id === item.productId);
      if (!product || item.quantity > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Not enough stock for ${item.productName}. Available: ${product?.stock || 0}`,
          variant: "destructive"
        });
        return;
      }
    }
    
    if (finalTotal < 0) {
      toast({
          title: "Invalid Discount",
          description: "Discount cannot be greater than the subtotal.",
          variant: "destructive"
      });
      return;
    }

    const saleData = {
        items: finalCart,
        subtotal: subtotal,
        discount: discount,
        total: finalTotal,
        date: new Date().toISOString(),
        cashierId: 'user-02', // Mock cashier
        memberId: selectedMember?.id || null,
        memberName: selectedMember?.name || null,
        memberName_lowercase: selectedMember?.name.toLowerCase() || null,
        remark: remarks || null,
    };

    try {
      const batch = writeBatch(db);

      const salesCol = collection(db, 'sales');
      const saleRef = doc(salesCol);
      batch.set(saleRef, saleData);

      for (const item of finalCart) {
        const productRef = doc(db, 'products', item.productId);
        const product = allProducts.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          batch.update(productRef, { stock: newStock });
        }
      }

      await batch.commit();
      
      const params = new URLSearchParams();
      params.set('saleId', saleRef.id);
      
      router.push(`/cashier/invoice?${params.toString()}`);
    } catch (error) {
      console.error("Error completing sale: ", error);
      toast({
        title: "Sale Failed",
        description: "Could not process the sale. Check console for details.",
        variant: "destructive"
      })
    }
  };
  
  const handleSelectMember = (memberName: string) => {
    const member = allMembers.find(
      (m) => m.name.toLowerCase() === memberName.toLowerCase()
    );
    setSelectedMember(member || null);
    setIsMemberPopoverOpen(false);
  };

  return (
    <>
      <QuantityDialog
        product={selectedProduct}
        isOpen={isQuantityDialogOpen}
        onClose={handleDialogClose}
        onConfirm={editingCartItem ? updateCartItemQuantity : addToCart}
        initialQuantity={editingCartItem ? editingCartItem.quantity : 1}
        isEditing={!!editingCartItem}
      />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for fabrics..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
                  {filteredProducts.map((product) => {
                    const imageUrl =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : 'https://placehold.co/600x400.png';
                    return (
                      <Card
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="cursor-pointer hover:shadow-md transition-shadow group"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-lg"
                            data-ai-hint="fabric swatch"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <PlusCircle className="h-8 w-8 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-2 text-sm">
                          <p className="font-semibold truncate">{product.name}</p>
                          <p className="text-muted-foreground">Rp{product.price.toLocaleString('id-ID')}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[400px]">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Current Sale</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">
                  Your cart is empty.
                </p>
              ) : (
                  <ScrollArea className="h-[30vh] pr-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.productId} className="cursor-pointer" onClick={() => handleEditCartItem(item)}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-center">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {e.stopPropagation(); removeFromCart(item.productId)}}>
                                      <XCircle className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
              )}
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex flex-col gap-4">
                <Separator />

                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-2">
                        <Popover open={isMemberPopoverOpen} onOpenChange={setIsMemberPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                            <UserIcon className="mr-2" />
                            {selectedMember ? selectedMember.name : "Select Member (Optional)"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search members..." />
                                <CommandList>
                                <CommandEmpty>No members found.</CommandEmpty>
                                <CommandGroup>
                                    {allMembers.map((member) => (
                                      <div
                                        key={member.id}
                                        onClick={() => handleSelectMember(member.name)}
                                        className="cursor-pointer"
                                      >
                                        <CommandItem
                                          value={member.name}
                                        >
                                            {member.name}
                                        </CommandItem>
                                      </div>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                        </Popover>
                        {selectedMember && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMember(null)}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                  
                    <Textarea placeholder="Add a remark (optional)..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                  
                    <div>
                      <Label htmlFor="discount">Discount (Rp)</Label>
                      <Input
                          id="discount"
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                      />
                    </div>
                </div>
                
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-destructive">-Rp{discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="w-full flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rp{finalTotal.toLocaleString('id-ID')}</span>
                </div>
                <Button onClick={handleCompleteSale} className="w-full" size="lg">
                  Complete Sale
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
