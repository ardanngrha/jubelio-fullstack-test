import type { Product } from '../models/Product.ts';

interface DummyJsonProduct {
  id: number;
  title: string;
  sku: string;
  price: number;
  thumbnail: string;
  description: string;
}

interface DummyJsonResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}

export async function fetchProductsFromDummyJson(): Promise<Product[]> {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=0');
    const data = (await response.json()) as DummyJsonResponse;

    return data.products.map(
      (product): Product => ({
        title: product.title,
        sku: product.sku,
        image: product.thumbnail,
        price: product.price,
        description: product.description,
      })
    );
  } catch (error) {
    console.error('Error fetching products from DummyJSON:', error);
    throw new Error('Failed to fetch products from external API', { cause: error });
  }
}
