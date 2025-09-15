import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    INSERT INTO products (title, sku, image, price, description) VALUES
    (
      'Weird Earbuds',
      'PROD-001',
      'https://images.unsplash.com/photo-1679421253067-b5adad691552?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      29.99,
      'Weird Earbuds is a versatile item perfect for everyday use. Crafted with high-quality materials, it offers durability and style. Whether you need it for work, travel, or leisure, this product is designed to meet your needs and exceed expectations. Enjoy its sleek design and reliable performance in any situation.'
    ),
    (
      'Vintage Nintendo',
      'PROD-002',
      'https://images.unsplash.com/photo-1653823642671-709d0479ac46?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      49.99,
      'Vintage Nintendo is a classic gaming console that brings back the nostalgia of 8-bit graphics and unforgettable gameplay. Perfect for retro gaming enthusiasts, it offers a library of timeless titles that have shaped the gaming industry. Experience the charm of pixelated adventures and relive the golden age of gaming with this iconic console.'
    );
  `);

  pgm.sql(`
    INSERT INTO adjustment_transactions (sku, qty) VALUES
    ('PROD-001', 10),
    ('PROD-001', 5),
    ('PROD-001', -3),
    ('PROD-001', 8),
    ('PROD-001', -2),
    ('PROD-001', 12),
    ('PROD-001', -5),
    ('PROD-001', 7),
    ('PROD-001', -1),
    ('PROD-001', 4),
    ('PROD-002', 15),
    ('PROD-002', 10),
    ('PROD-002', -4),
    ('PROD-002', 20),
    ('PROD-002', -6),
    ('PROD-002', 9),
    ('PROD-002', -3),
    ('PROD-002', 11),
    ('PROD-002', -2),
    ('PROD-002', 6);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DELETE FROM adjustment_transactions WHERE sku IN ('PROD-001', 'PROD-002');`);

  pgm.sql(`DELETE FROM products WHERE sku IN ('PROD-001', 'PROD-002');`);
}
