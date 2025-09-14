'use client';

import { useEffect, useState } from 'react';
import useProductStore from '@/stores/product-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductList } from './components/product-list';
import { ProductFormDialog } from './components/product-form-dialog';
import useDebounce from '@/hooks/use-debounce';
import { ImportConfirmationDialog } from './components/import-confirmation-dialog';

export default function ProductsPage() {
  const { totalProducts, setSearchQuery } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <span className="text-lg pt-1 text-muted-foreground">
            ({totalProducts} items)
          </span>
        </div>

        <div className="flex w-full sm:w-auto items-center space-x-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <ImportConfirmationDialog>
            <Button variant="outline">Import</Button>
          </ImportConfirmationDialog>
          <ProductFormDialog>
            <Button>Add Product</Button>
          </ProductFormDialog>
        </div>
      </div>
      <ProductList />
    </div>
  );
}
