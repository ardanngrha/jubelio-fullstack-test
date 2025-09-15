'use client';
import useAdjustmentStore from '@/stores/adjustment-transaction-store';
import { Button } from '@/components/ui/button';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { useEffect, useState } from 'react';
import { AdjustmentFormDialog } from './components/adjustment-form-dialog';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/use-debounce';

export default function AdjustmentsPage() {
  const {
    adjustments,
    fetchAdjustments,
    page,
    totalPages,
    isLoading,
    totalAdjustments,
    setSearchQuery,
  } = useAdjustmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchAdjustments(1);
  }, [fetchAdjustments]);

  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchAdjustments(newPage);
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
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <Input
            placeholder="Search by SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <AdjustmentFormDialog>
            <Button>New Adjustment</Button>
          </AdjustmentFormDialog>
        </div>
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
