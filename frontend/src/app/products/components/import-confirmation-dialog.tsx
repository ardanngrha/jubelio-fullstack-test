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
      const result = await importProducts();
      toast.success(
        `Successfully imported products. Imported: ${result.inserted}. Duplicates: ${result.skipped}`,
      );
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
            This action will import products from dummyjson.com. Existing
            products with the same SKU will not be duplicated.
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
