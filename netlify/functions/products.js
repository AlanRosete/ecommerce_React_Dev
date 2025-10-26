import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export const handler = async () => {
  try {
    const result = await pool.query("SELECT * FROM products");
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
