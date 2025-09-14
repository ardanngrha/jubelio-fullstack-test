'use client';
import { useEffect } from 'react';
import useProductStore from '@/stores/product-store';
import { ProductCard } from './product-card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function ProductList() {
  const { products, fetchProducts, page, totalPages, isLoading } =
    useProductStore();

  useEffect(() => {
    // Initial fetch
    fetchProducts(1);
  }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchProducts(newPage);
    }
  };

  if (products.length === 0 && isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
        {products.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
      <Separator />
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
