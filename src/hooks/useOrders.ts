import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';

interface OrderWithDetails extends Order {
  table_number?: number;
  items?: {
    id: string;
    menu_item_name: string;
    quantity: number;
    price_at_order: number;
    special_instructions?: string;
  }[];
}

export function useOrders(statusFilter?: string) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);

        // Build query
        let query = supabase
          .from('orders')
          .select(`
            *,
            tables!inner(table_number),
            order_items(
              id,
              quantity,
              price_at_order,
              special_instructions,
              menu_items(name)
            )
          `)
          .order('created_at', { ascending: false });

        // Apply status filter if provided
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to match interface
        const ordersWithDetails = data.map((order: any) => ({
          ...order,
          table_number: order.tables?.table_number,
          items: order.order_items?.map((item: any) => ({
            id: item.id,
            menu_item_name: item.menu_items?.name || 'Unknown',
            quantity: item.quantity,
            price_at_order: item.price_at_order,
            special_instructions: item.special_instructions,
          })),
        }));

        setOrders(ordersWithDetails);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();

    // Optional: Set up real-time subscription
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  return { orders, isLoading, error };
}
