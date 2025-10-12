import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/types';

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        setMenuItems(data || []);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return { menuItems, isLoading, error };
}
