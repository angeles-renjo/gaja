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
          .order('subcategory', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true });

        if (error) throw error;

        // Resolve image_url: accept either full URL or storage key
        const items = (data || []).map((item) => {
          const val = item.image_url as string | null;
          let resolvedUrl: string | undefined = undefined;
          if (val) {
            if (/^https?:\/\//i.test(val)) {
              resolvedUrl = val; // already a full URL
            } else {
              const { data: urlData } = supabase.storage.from('menu').getPublicUrl(val);
              resolvedUrl = urlData.publicUrl;
            }
          }
          return { ...item, image_url: resolvedUrl } as MenuItem;
        });

        setMenuItems(items);
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
