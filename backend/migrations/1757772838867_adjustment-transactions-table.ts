import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('adjustment_transactions', {
    id: { type: 'serial', primaryKey: true },
    sku: { type: 'varchar(100)', notNull: true, references: 'products(sku)', onDelete: 'CASCADE' },
    qty: { type: 'integer', notNull: true },
    amount: { type: 'decimal(10,2)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('adjustment_transactions', 'sku', { name: 'idx_adjustment_transactions_sku' });

  pgm.createTrigger('adjustment_transactions', 'update_adjustment_transactions_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTrigger('adjustment_transactions', 'update_adjustment_transactions_updated_at');
  pgm.dropIndex('adjustment_transactions', 'idx_adjustment_transactions_sku');
  pgm.dropTable('adjustment_transactions');
  pgm.sql('DROP FUNCTION IF EXISTS update_updated_at_column();');
}
