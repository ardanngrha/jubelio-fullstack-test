'use client';
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useProductStore from '@/stores/product-store';
import { Product, ProductPayload } from '@/types';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormDialogProps {
  children: React.ReactNode;
  product?: Product;
}

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  sku: z.string().min(2, { message: 'SKU must be at least 2 characters.' }),
  image: z.string().url({ message: 'Please enter a valid URL.' }),
  price: z.coerce
    .number()
    .positive({ message: 'Price must be a positive number.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
});

export function ProductFormDialog({
  children,
  product,
}: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { addProduct, updateProduct } = useProductStore();
  const isEditMode = !!product;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || '',
      sku: product?.sku || '',
      image: product?.image || '',
      price: product?.price || 0,
      description: product?.description || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: ProductPayload = values;
      if (isEditMode) {
        await updateProduct(product.sku, payload);
        toast.success('Product updated successfully!');
      } else {
        await addProduct(payload);
        toast.success('Product created successfully!');
        form.reset();
      }
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Make changes to your product here.'
              : 'Add a new product to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 py-4"
        >
          {/* Form Fields */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              {...form.register('title')}
              className="col-span-3"
            />
            {form.formState.errors.title && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU
            </Label>
            <Input
              id="sku"
              {...form.register('sku')}
              className="col-span-3"
              disabled={isEditMode}
            />
            {form.formState.errors.sku && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.sku.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image URL
            </Label>
            <Textarea
              id="image"
              {...form.register('image')}
              className="col-span-3"
            />
            {form.formState.errors.image && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.image.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...form.register('price')}
              className="col-span-3"
            />
            {form.formState.errors.price && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              {...form.register('description')}
              className="col-span-3"
            />
            {form.formState.errors.description && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
        </form>
        <DialogFooter>
          {isEditMode && product && (
            <DeleteConfirmationDialog
              sku={product.sku}
              onDeleted={() => setOpen(false)}
            />
          )}
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
