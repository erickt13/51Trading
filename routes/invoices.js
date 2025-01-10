const express = require('express')
const router = express.Router()
const Invoice = require('../models/invoice')
const Customer = require('../models/customer')
const Product = require('../models/product')

 
// All invoices route
router.get('/', async (req,res) => {

    let searchOptions = {}
    if (req.query.invoiceNumber != null && req.query.invoiceNumber != '') {
        searchOptions.invoiceNumber = new RegExp(req.query.invoiceNumber, 'i')
    }
    try {
        const invoices = await Invoice.find(searchOptions).populate('customer').populate('items')
       
        // console.log(invoices)
        res.render('invoices/index', {
            invoices: invoices, 
            searchOptions: req.query
        })
    } catch (err){
        res.redirect('/')
        console.log(err)
    }
})

// fetch api find product by mpn route
router.get('/:mpn/addproductbympn', async (req, res) => {

    try {
        // Get the mpn from the route params
        const { mpn } = req.params;

        // Find the product by mpn
        const product = await Product.findOne({ mpn: mpn });

        if (!product) {
            return res.json({ errorMessage: 'Product not found' });
        }
         

        // return res.status(200).json({
        //     message: 'Product found',
        //     product: product
        // });

        return res.status(200).json(product);

    }   
    catch (error) {
        res.redirect('/', errorMessage) // redirect to invoices index page.
    } 
});

// fetch api find product by id route
router.get('/:id/addproductbyid', async (req,res) => {

    try {
        const invoice = await Invoice.findById(req.params.id); // get the invoice from req query string
        const product = await Product.findById(req.params.id); // get the selected product from req query string
        res.json(product) // Send the product to the client via json.
    
    } catch (error) {
        res.redirect('/', {errorMessage : 'Error adding product!'}) // redirect to invoices index page.
    }
    })

// New invoice route
router.get('/new', async (req,res) => {
    renderNewPage(res, new Invoice())
});

// Create new invoice route
router.post('/', async (req,res) => {
    const { invoiceNumber, customer, items, date, totalAmount, signature } = req.body; // Destructure the request body
    const invoice = new Invoice({
        invoiceNumber,
        customer,
        items: items || [], // Initialize items as an empty array
        totalAmount, // Initialize totalAmount
        date: date ? new Date(date) : Date.now(), // Ensure date is a Date object
        signature: "#"
    });

    // console.log(invoice);

    // const invoiceItems = items.map(item => ({
    //     source: item.source,
    //     notes: item.notes,
    //     mpn: item.mpn,
    //     description: item.description,
    //     quantity: parseInt(item.quantity, 10),
    //     price: parseFloat(item.price), 
    //     subTotal: parseFloat(item.subTotal),
    //     status: item.status
    // }));

    try {
        const newInvoice = await invoice.save();
        res.redirect(`/invoices/${newInvoice.id}`)
    } catch (error) {
        renderNewPage(res, invoice, true)  
        console.log(error)
    }
}) 

// show invoice route
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('customer') // populate customer objectid 
        console.log(invoice);
        res.render('invoices/show', {
           invoice: invoice
        })
   } catch (error) {
       res.redirect('/')
       console.log(error)
   }
})

// edit invoice route
router.get('/:id/edit', async (req, res) => {
    
    try {
        const customers = await Customer.find({})
        const products = await Product.find({}).limit(10).sort({ description: 1 })
        const invoice = await Invoice.findById(req.params.id).populate('customer')
     
        res.render('invoices/edit', {
            invoice : invoice,
            customers : customers,
            products: products
        })
        
    } catch (error) {
        res.redirect('/invoices')
        console.log(error)
    }
})

// update invoice route
router.put('/:id', async (req, res) => {
    let invoice
    try {
        invoice = await Invoice.findById(req.params.id).populate('customer')

        const items = req.body.items || []; // items is undefinbed if no item are in the product list and it throws an error if click update.
        
        // console.log(items);
        
        const invoiceItems = items.map(item => ({
            source: item.source,
            notes: item.notes,
            mpn: item.mpn,
            productId: item.productId,
            description: item.description,
            quantity: parseInt(item.quantity, 10),
            price: parseFloat(item.price), 
            subTotal: parseFloat(item.subTotal),
            status: item.status
        }));
        
        // console.log(invoiceItems);

        invoice.invoiceNumber = req.body.invoiceNumber;
        invoice.customer = req.body.customer;
        invoice.signature = invoice.signature;
        invoice.totalAmount = req.body.totalAmount; 
        invoice.items = invoiceItems; 

        // Cannot read properties of null (reading 'id') hapens when the input field is null beause theres no value in it.
        // it will also give you an error if the model has a required on the mpn number but the invoice items input field does not have it.
        // console.log(invoice);

        await invoice.save();

        res.redirect(`/invoices/${invoice.id}`)
       
    } catch {
        if (invoice = null) {
            res.redirect('/')
        } else {
            res.render('invoices/edit', {
                invoice : invoice,
                errorMessage : 'Error updating invoice'
            })
        }
    }
})

// update signature route
// router.put('/:id/signature', async (req, res) => {
//     let invoice
//     try {
//         invoice = await Invoice.findById(req.params.id);

//         invoice.signature = req.body.signature;

//         await invoice.save();

//         res.redirect(`/invoices/${invoice.id}`)
       
//     } catch {
//         if (invoice == null) {
//             res.redirect('/')
//         } else {
//             res.render('invoices/edit', {
//                 invoice : invoice,
//                 errorMessage : 'Error updating signature'
//             })
//         }
//     }
// })

router.put('/:id/signature', async (req, res) => {
    let invoice;
    try {
        // Find the invoice by its ID
        invoice = await Invoice.findById(req.params.id);
        // console.log (invoice);

        if (!invoice) {
            // If the invoice is not found, respond with a 404 error
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Update the signature field
        updatedSignature = req.body.signature;
        invoice.signature = updatedSignature;
         // Save the updated invoice
        await invoice.save();

        // Return a success response with the updated invoice
        res.json(invoice);  // Optionally, you could return a redirect or the updated invoice
    } catch (error) {
        // If an error occurs (e.g., server issues), respond with a 500 error and error message
        console.error(error);
        res.status(500).json({
            error: 'Error updating signature'
        });
    }
});

// delete invoice route

router.delete('/:id', async (req, res) => {
    let invoice
    try {
        invoice = await Invoice.findByIdAndDelete(req.params.id)
        res.redirect('/invoices')
    } catch (e){
        if (invoice = null) {
            res.redirect('/')
        } else {
            res.redirect(`/invoices/${invoice.id}`)
        }
    }
})

async function renderNewPage(res, invoice, hasError = false) {
    try {
        const customers = await Customer.find({})
        const products = await Product.find({}).limit(10).sort({ description: 1 }) // 1 for ascending, -1 for descending
        params = {
            customers: customers,
            products: products,
            invoice: invoice
        }
        if (hasError) params.errorMessage = 'Error creating Invoice!'
        
        res.render('invoices/new', params)
        
    } catch (error) {
        res.redirect('/invoices')
        console.log(error)
    }
}

module.exports = router



