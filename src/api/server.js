require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const database = require('./database');

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await database.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const { rows } = await database.query(
      'SELECT * FROM products WHERE uri = $1 LIMIT 1',
      [productId]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/products/related/:id', async (req, res) => {
  const category = req.params.id;
  try {
    const { rows } = await database.query(
      'SELECT * FROM products WHERE category = $1 LIMIT 4',
      [category]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
