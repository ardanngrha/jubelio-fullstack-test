'use client';
import useAdjustmentStore from '@/stores/adjustment-transaction-store';
import { Button } from '@/components/ui/button';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { useEffect } from 'react';
import { AdjustmentFormDialog } from './components/adjustment-form-dialog';

export default function AdjustmentsPage() {
  const {
    adjustments,
    fetchAdjustments,
    page,
    totalPages,
    isLoading,
    totalAdjustments,
  } = useAdjustmentStore();

  useEffect(() => {
    fetchAdjustments(1);
  }, [fetchAdjustments]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchAdjustments(page + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <span className="text-lg pt-1 text-muted-foreground">
            ({totalAdjustments} items)
          </span>
        </div>
        <AdjustmentFormDialog>
          <Button>New Adjustment</Button>
        </AdjustmentFormDialog>
      </div>
      <DataTable
        columns={columns}
        data={adjustments}
        onLoadMore={handleLoadMore}
        hasMore={page < totalPages}
        isLoading={isLoading}
      />
    </div>
  );
}
