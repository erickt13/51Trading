const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const Product = require('../models/product');

async function replaceAllProducts(products) {
  await Product.deleteMany({});
  const result = await Product.insertMany(products);
  console.log(`Deleted all, inserted ${result.length} new products`);
  return result;
}

router.post('/bulk-insert', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../products.json');
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const result = await replaceAllProducts(products);

    res.json({
      success: true,
      insertedCount: result.length,
      message: `Deleted old products and inserted ${result.length} new ones`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;