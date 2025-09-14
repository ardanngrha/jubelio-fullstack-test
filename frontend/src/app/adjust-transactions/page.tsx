'use client';
import useAdjustmentStore from '@/stores/adjustment-transaction-store';
import { Button } from '@/components/ui/button';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { useEffect } from 'react';
import { AdjustmentFormDialog } from './components/adjustment-form-dialog';

export default function AdjustmentsPage() {
  const { adjustments, fetchAdjustments, page, totalPages, isLoading } =
    useAdjustmentStore();

  useEffect(() => {
    fetchAdjustments(1);
  }, [fetchAdjustments]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchAdjustments(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Adjust Transactions
        </h1>
        <AdjustmentFormDialog>
          <Button>New Adjustment</Button>
        </AdjustmentFormDialog>
      </div>
      <DataTable
        columns={columns}
        data={adjustments}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
