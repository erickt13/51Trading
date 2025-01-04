const express = require('express')
const router = express.Router()
const Customer = require('../models/customer')
const Invoice = require('../models/invoice')


//All customers route
router.get('/', async (req,res) => {
    let searchOptions = {}
    if (req.query.companyName != null && req.query.companyName != '') {
        searchOptions.companyName = new RegExp(req.query.companyName, 'i')
    }
    try {
        const customers = await Customer.find(searchOptions)
        res.render('customers/index', {
            customers: customers, 
            searchOptions: req.query
        })
        // console.log(customers)
    } catch (err){
        res.redirect('/')
        // console.log(err)
    }
})

//New customer route
router.get('/new', (req,res) => {
    res.render('customers/new', {customer : new Customer()})
}) 
//Create customer route
router.post('/', async (req,res) => { 
    const customer = new Customer({
        companyName: req.body.companyName,
        address: {
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.zipcode,
            country: req.body.country
        },
        phoneNumber: req.body.phoneNumber,
        faxNumber: req.body.faxNumber,
        email: req.body.email
    })

    try {
        const newCustomer = await customer.save()
        res.redirect('customers')
    } catch (err){
        res.render('customers/new', {
            customer : customer,
            errorMessage : 'Error creating customer'
        })
    }
})

// show customer route

router.get('/:id', async (req, res) => {
    try {
         const customer = await Customer.findById(req.params.id);
         const invoices = await Invoice.find({customer: customer.id});
         res.render('customers/show', {
            customer: customer,
            customerInvoices: invoices
         })
         
    } catch (error) {
        res.redirect('/')
    }
})

// edit customer route
router.get('/:id/edit', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
        res.render('customers/edit', {customer : customer})
    } catch (error) {
        res.redirect('/customers')
    }
    // res.send('edit customer id ' + req.params.id)

})

// update customer route

router.put('/:id', async (req,res) =>{
    let customer
    try {
        customer = await Customer.findById(req.params.id)
        customer.companyName = req.body.companyName
        customer.address.street = req.body.street
        customer.address.city = req.body.city
        customer.address.state = req.body.state
        customer.address.zipcode = req.body.zipcode
        customer.address.country = req.body.country
        customer.phoneNumber = req.body.phoneNumber
        customer.faxNumber = req.body.faxNumber
        customer.email = req.body.email
         await customer.save()
        res.redirect(`/customers/${customer.id}`)
    } catch {
        if (customer = null) {
            res.redirect('/')
        } else {
            res.render('customers/edit', {
                customer : customer,
                errorMessage : 'Error updating product'
            })
        }
    }
    // res.send('update customer id ' + req.params.id)
})

// delete customer route
router.delete('/:id', async (req,res) =>{
    let customer
    try {
        customer = await Customer.findByIdAndDelete(req.params.id)
        // await product.deleteOne() 
        res.redirect('/customers')
    } catch (e){
        if (customer = null) {
            res.redirect('/')
            // console.log(e)
        } else {
            res.redirect(`/customers/${customer.id}`)
            // console.log(e)
        }
    }
    // res.send('delete customer id ' + req.params.id)
})

module.exports = router