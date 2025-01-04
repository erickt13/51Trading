// Express app approach
const express = require('express');
// const mongoose = require('mongoose');
const router = express.Router();

// Assuming you have a Product model
const Product = require('../models/product')

// Function to bulk insert products
async function bulkInsertProducts(products) {
  try {
    const result = await Product.insertMany(products, {
      ordered: true,  // Set to false if you want to continue inserting even if some documents fail
      rawResult: true // Get detailed information about the insert operation
    });
    
    console.log(`Successfully inserted ${result.insertedCount} products`);
    return result;
  } catch (error) {
    console.error('Bulk insert failed:', error);
    throw error;
  }
}

// Express route to handle bulk insert
router.post('/bulk-insert', async (req, res) => {
    try {
      const products = req.body.products;
      
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Products must be an array' });
      }
      
      const result = await bulkInsertProducts(products);
      res.json({
        success: true,
        insertedCount: result.insertedCount,
        message: `Successfully inserted ${result.insertedCount} products`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Example usage of the bulk insert function
  const productsToInsert = [
    {
      name: "Product 1",
      price: 29.99,
      description: "Description 1",
      sku: "SKU001"
    },
    {
      name: "Product 2",
      price: 39.99,
      description: "Description 2",
      sku: "SKU002"
    }
  ];
  
  // Call the function
  bulkInsertProducts(productsToInsert)
    .then(result => console.log('Insertion complete:', result))
    .catch(error => console.error('Error:', error));
  
  module.exports = router;