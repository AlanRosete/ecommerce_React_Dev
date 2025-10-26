import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
}

export function subscribeProducts_v1(onEvent) {
  const subscription = supabase
    .from('products')
    .on('*', payload => onEvent(payload))
    .subscribe();

  return subscription;
}

export function subscribeProducts_v2(onEvent) {
  const channel = supabase
    .channel('public:products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      payload => onEvent(payload)
    )
    .subscribe();

  return channel;
}
