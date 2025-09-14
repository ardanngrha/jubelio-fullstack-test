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
import useAdjustmentStore from '@/stores/adjustment-transaction-store';
import { AdjustmentTransaction, AdjustmentPayload } from '@/types';

interface AdjustmentFormDialogProps {
  children: React.ReactNode;
  adjustment?: AdjustmentTransaction;
}

const formSchema = z.object({
  sku: z.string().min(1, { message: 'SKU is required.' }),
  qty: z.coerce
    .number()
    .int()
    .refine((val) => val !== 0, { message: 'Quantity cannot be zero.' }),
});

export function AdjustmentFormDialog({
  children,
  adjustment,
}: AdjustmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { addAdjustment, updateAdjustment } = useAdjustmentStore();
  const isEditMode = !!adjustment;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: adjustment?.sku || '',
      qty: adjustment?.qty || 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: AdjustmentPayload = values;
      if (isEditMode) {
        await updateAdjustment(adjustment.id, payload);
        toast.success('Adjustment updated successfully!');
      } else {
        await addAdjustment(payload);
        toast.success('Adjustment created successfully!');
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
            {isEditMode ? 'Edit Adjustment' : 'New Adjustment'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the SKU or quantity for this transaction.'
              : 'Enter SKU and quantity to adjust stock.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU
            </Label>
            <Input id="sku" {...form.register('sku')} className="col-span-3" />
            {form.formState.errors.sku && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.sku.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">
              Quantity
            </Label>
            <Input
              id="qty"
              type="number"
              {...form.register('qty')}
              className="col-span-3"
            />
            {form.formState.errors.qty && (
              <p className="col-span-4 text-xs text-red-500 text-right">
                {form.formState.errors.qty.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
