// Database Types
export interface Table {
  id: string;
  table_number: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'beverage';
  image_url?: string;
  ingredients?: string[];
  allergies?: string[];
  available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  table_id: string;
  table_number?: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_order: number;
  special_instructions?: string;
  created_at: string;
}

// Frontend Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface OrderRequest {
  table_id: string;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
}

export interface OrderResponse {
  success: boolean;
  order_id?: string;
  message?: string;
}
