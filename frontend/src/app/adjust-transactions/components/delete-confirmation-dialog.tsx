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
import useAdjustmentStore from '@/stores/adjustment-transaction-store';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  adjustmentId: number;
}

export function DeleteConfirmationDialog({
  adjustmentId,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const removeAdjustment = useAdjustmentStore(
    (state) => state.removeAdjustment,
  );

  const handleDelete = async () => {
    try {
      await removeAdjustment(adjustmentId);
      toast.success('Transaction deleted successfully.');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to delete Transaction.');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-red-500">
          <span className="sr-only">Delete</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            transaction.
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
