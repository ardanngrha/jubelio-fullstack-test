'use client';
import { useEffect, useRef, useCallback } from 'react';
import useProductStore from '@/stores/product-store';
import { ProductCard } from './product-card';
import { Loader2 } from 'lucide-react';

export function ProductList() {
  const { products, fetchProducts, page, totalPages, isLoading } =
    useProductStore();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          fetchProducts(page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, page, totalPages, fetchProducts],
  );

  useEffect(() => {
    // Initial fetch
    fetchProducts(1);
  }, [fetchProducts]);

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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
        {products.map((product, index) => {
          if (products.length === index + 1) {
            return (
              <div ref={lastProductElementRef} key={`${product.sku}-${index}`}>
                <ProductCard product={product} />
              </div>
            );
          } else {
            return (
              <ProductCard key={`${product.sku}-${index}`} product={product} />
            );
          }
        })}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
