import { useState } from 'react';
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
import useProductStore from '@/stores/product-store';
import { toast } from 'sonner';

interface DeleteConfirmationDialogProps {
  sku: string;
  onDeleted: () => void;
}

export function DeleteConfirmationDialog({
  sku,
  onDeleted,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const removeProduct = useProductStore((state) => state.removeProduct);

  const handleDelete = async () => {
    try {
      await removeProduct(sku);
      toast.success('Product deleted successfully');
      onDeleted();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            product and all associated adjustment transactions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
