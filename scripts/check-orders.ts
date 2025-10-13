import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  console.log('🔍 Checking orders in database...\n');

  // Get order count
  const { count, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting orders:', countError);
    return;
  }

  console.log(`📊 Total orders: ${count}\n`);

  // Get recent orders with details
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      created_at,
      tables!inner(table_number),
      order_items(
        quantity,
        price_at_order,
        special_instructions,
        menu_items(name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('❌ No orders found in database');
    return;
  }

  console.log('📋 Recent orders:\n');
  orders.forEach((order: any, index: number) => {
    console.log(`${index + 1}. Order ID: ${order.id.substring(0, 8)}...`);
    console.log(`   Table: ${order.tables.table_number}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: $${Number(order.total_amount).toFixed(2)}`);
    console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
    console.log(`   Items:`);
    order.order_items.forEach((item: any) => {
      console.log(`     - ${item.quantity}x ${item.menu_items.name} ($${Number(item.price_at_order).toFixed(2)} each)`);
      if (item.special_instructions) {
        console.log(`       Note: ${item.special_instructions}`);
      }
    });
    console.log('');
  });

  console.log('✅ Order check complete!');
}

checkOrders().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
