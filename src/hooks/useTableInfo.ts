import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrderStore } from '@/stores/order-store';

export function useTableInfo(tableId: string | null) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTableInfo } = useOrderStore();

  useEffect(() => {
    if (!tableId) return;

    async function fetchTableInfo() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('tables')
          .select('table_number')
          .eq('id', tableId)
          .single();

        if (error) throw error;

        setTableNumber(data.table_number);
        setTableInfo(tableId!, data.table_number);
      } catch (err) {
        console.error('Error fetching table info:', err);
        setError(err instanceof Error ? err.message : 'Invalid table');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTableInfo();
  }, [tableId, setTableInfo]);

  return { tableNumber, isLoading, error };
}
