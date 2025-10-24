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

// Type for the raw Supabase response with joins
interface SupabaseOrderResponse extends Order {
  tables?: { table_number: number };
  order_items?: {
    id: string;
    quantity: number;
    price_at_order: number;
    special_instructions?: string;
    menu_items?: { name: string };
  }[];
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);

        // Fetch all orders (newest first)
        const { data, error } = await supabase
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

        if (error) throw error;

        // Transform data to match interface
        const ordersWithDetails = (data as SupabaseOrderResponse[]).map((order) => ({
          ...order,
          table_number: order.tables?.table_number,
          items: order.order_items?.map((item) => ({
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
  }, []);

  return { orders, isLoading, error };
}
