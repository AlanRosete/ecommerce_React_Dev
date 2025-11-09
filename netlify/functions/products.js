import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  try {
    const path = event.path;
    const idMatch = path.match(/products\/([^/]+)$/);

    // Retorno General, todos los productos
    if (!idMatch) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    }

    // Manejador unico, producto por ID al ver detalles del producto
    const productId = idMatch[1];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('uri', productId)
      .limit(1);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error en petición', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
