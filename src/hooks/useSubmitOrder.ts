import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/stores/cart-store';
import { useOrderStore } from '@/stores/order-store';

export function useSubmitOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items, getTotalAmount, clearCart } = useCartStore();
  const { tableId, setCurrentOrderId } = useOrderStore();

  const submitOrder = async (): Promise<string | null> => {
    if (!tableId) {
      setError('Table information is missing');
      return null;
    }

    if (items.length === 0) {
      setError('Cart is empty');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const totalAmount = getTotalAmount();

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price_at_order: item.menuItem.price,
        special_instructions: item.specialInstructions || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // TODO: Phase 2 - Send to printer
      // await fetch('/api/print', {
      //   method: 'POST',
      //   body: JSON.stringify({ orderId: order.id })
      // });

      setCurrentOrderId(order.id);
      clearCart();

      return order.id;
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit order');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting, error };
}
