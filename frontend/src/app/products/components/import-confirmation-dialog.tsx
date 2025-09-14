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

export function ImportConfirmationDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const importProducts = useProductStore((state) => state.importProducts);

  const handleImport = async () => {
    try {
      await importProducts();
      toast.success('Products imported successfully');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to import products');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action will import products from dummyjson.com. This may create
            duplicate products if they already exist.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
