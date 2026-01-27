import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mapExternalProduct = (product, media = [], stats = []) => {
  const thumb =
    media.find(m => m.type === 'thumb')?.url ||
    media[0]?.url ||
    '';

  const market = stats[0];

  return {
    id: `ext_${product.id}`,
    title: product.name,
    category: product.product_category,
    description: product.description,
    image: thumb || '/images/placeholder.jpg',
    price: market?.last_sale ?? market?.lowest_ask ?? null,
    rating: 0,
    color: null,
    discounted_price: null,
    uri: product.url_key || product.uri || product.id
  };
};

export const handler = async (event) => {
  try {
    const path = event.path || '';
    const idMatch = path.match(/products\/([^/]+)$/);

    if (!idMatch) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    }

    const productId = idMatch[1];

    const { data: localData, error: localErr } = await supabase
      .from('products')
      .select('*')
      .eq('uri', productId)
      .limit(1);

    if (localErr) throw localErr;

    if (localData && localData.length) {
      return {
        statusCode: 200,
        body: JSON.stringify(localData),
      };
    }

    const { data: extProducts, error: extErr } = await supabase
      .from('external_products')
      .select('*')
      .or(`url_key.eq.${productId},uri.eq.${productId}`)
      .limit(1);

    if (extErr) throw extErr;

    if (!extProducts || extProducts.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    const ext = extProducts[0];

    const { data: medias } = await supabase
      .from('product_media')
      .select('*')
      .eq('product_id', ext.id);

    const { data: stats } = await supabase
      .from('market_stats')
      .select('*')
      .eq('product_id', ext.id)
      .order('recorded_at', { ascending: false })
      .limit(1);

    const mapped = mapExternalProduct(ext, medias || [], stats || []);

    return {
      statusCode: 200,
      body: JSON.stringify([mapped]),
    };

  } catch (error) {
    console.error('Error en petición', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal error' }),
    };
  }
};
