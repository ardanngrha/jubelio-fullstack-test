import Image from 'next/image';
import { Product } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ProductFormDialog } from './product-form-dialog';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <ProductFormDialog product={product}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <CardHeader>
          <div className="aspect-square relative w-full bg-muted rounded-md overflow-hidden">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-lg truncate">{product.title}</CardTitle>
          <CardDescription>{product.sku}</CardDescription>
          <p className="font-semibold mt-2">${product.price}</p>
          <p className="text-sm text-muted-foreground">
            Stock: {product.stock}
          </p>
        </CardContent>
      </Card>
    </ProductFormDialog>
  );
}
