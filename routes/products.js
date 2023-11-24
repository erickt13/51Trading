const express = require('express')
const router = express.Router()
const Product = require('../models/product')


//All products route
router.get('/', async (req,res) => {
    let searchOptions = {}
    if (req.query.npm != null && req.query.npm != '') {
        searchOptions.npm = new RegExp(req.query.npm, 'i')
    }
    try {
        const products = await Product.find(searchOptions)
        res.render('products/index', {
            products: products, 
            searchOptions: req.query
            
        })
        console.log(products)
    } catch (err){
        res.redirect('/')
        console.log(err)
    }
    
})

//New product route
router.get('/new', (req,res) => {
    res.render('products/new', {product : new Product()})
}) 
//Create product route
router.post('/', async (req,res) => { 
    const product = new Product({
        npm: req.body.npm,
        itemNumber: req.body.itemNumber,
        description: req.body.description,
        price: req.body.price
    })

    try {
        const newProduct = await product.save()
        res.redirect('products')
        // res.redirect(`/products/${newProduct.id}`)
    } catch {
            res.render('products/new', {
                product : product,
                errorMessage : 'Error creating product'
            })
    }
})

module.exports = router