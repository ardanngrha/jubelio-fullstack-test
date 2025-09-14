'use client';
import { useEffect, useRef, useCallback } from 'react';
import useProductStore from '@/stores/product-store';
import { ProductCard } from './product-card';
import { Loader2 } from 'lucide-react';

export function ProductList() {
  const { products, fetchProducts, hasMore, isLoading } = useProductStore();
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Initial fetch
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  const lastProductElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchProducts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, fetchProducts],
  );

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => {
          if (products.length === index + 1) {
            return (
              <div ref={lastProductElementRef} key={product.sku}>
                <ProductCard product={product} />
              </div>
            );
          }
          return <ProductCard key={product.sku} product={product} />;
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
