const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const fs = require('fs');

// Route to handle bulk insert
router.post('/bulk-insert', async (req, res) => {
    try {
      // Read the products from your JSON file
      const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
      
      // Insert the products
      const result = await Product.insertMany(products);
      
      res.json({
        success: true,
        insertedCount: result.length,
        message: `Successfully inserted ${result.length} products`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

//   test bulk insert with (curl -X POST http://localhost:3000/products/bulk-insert) in bash terminal


// All products route
router.get('/', async (req,res) => {
    let searchOptions = {}
    if (req.query.description != null && req.query.description != '') {
        searchOptions.description = new RegExp(req.query.description, 'i')
    }
    try {
        const products = await Product.find(searchOptions).limit(20).sort({ description: 1 }) // 1 for ascending, -1 for descending
        res.render('products/index', {
            products: products, 
            searchOptions: req.query
            
        })
    } catch (err){
        res.redirect('/')
    }
})

// New product route
router.get('/new', (req,res) => {
    res.render('products/new', {product : new Product()})
}) 

// Create product route
router.post('/', async (req,res) => { 
    const product = new Product({
        mpn: req.body.mpn,
        itemNumber: req.body.itemNumber,
        description: req.body.description,
        price: parseFloat(req.body.price).toFixed(2) 
    })

    try {
        const newProduct = await product.save()
        res.redirect(`/products/${newProduct.id}`)
    } catch {
            res.render('products/new', { 
            product : product,
            errorMessage : 'Error creating product'
            })
    }
})

// show prouct route
router.get('/:id', async (req, res) => {
    try {
         const product = await Product.findById(req.params.id)
         res.render('products/show', {
            product: product
         })
    } catch (error) {
        res.redirect('/')
    }
    // res.send('Show Product ' + req.params.id)
})

// edit product route
router.get('/:id/edit', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.render('products/edit', {product : product})
    } catch (error) {
        res.redirect('/products')
    }
})

// update product route
router.put('/:id', async (req, res) => {
    let product
    try {
        product = await Product.findById(req.params.id)
        product.mpn = req.body.mpn
        product.itemNumber = req.body.itemNumber
        product.description = req.body.description
        product.price = parseFloat(req.body.price).toFixed(2); 
        await product.save()
        res.redirect(`/products/${product.id}`)
    } catch {
        if (product = null) {
            res.redirect('/')
        } else {
            res.render('products/edit', {
                product : product,
                errorMessage : 'Error updating product'
            })
        }
    }
})

// delete product route

router.delete('/:id', async (req, res) => {
    let product
    try {
        product = await Product.findByIdAndDelete(req.params.id)
        // await product.deleteOne() 
        res.redirect('/products')
    } catch (e){
        if (product = null) {
            res.redirect('/')
            // console.log(e)
        } else {
            res.redirect(`/products/${product.id}`)
            // console.log(e)
        }
    }
})

module.exports = router