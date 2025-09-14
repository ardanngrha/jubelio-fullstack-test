'use client';
import { ColumnDef } from '@tanstack/react-table';
import { AdjustmentTransaction } from '@/types';
import { AdjustmentFormDialog } from './adjustment-form-dialog';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export const columns: ColumnDef<AdjustmentTransaction>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'qty',
    header: 'Quantity',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const adjustment = row.original;
      return (
        <div className="text-right">
          <AdjustmentFormDialog adjustment={adjustment}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Edit</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </AdjustmentFormDialog>
          <DeleteConfirmationDialog adjustmentId={adjustment.id} />
        </div>
      );
    },
  },
];
