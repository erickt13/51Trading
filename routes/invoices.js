const express = require('express')
const router = express.Router()
const Invoice = require('../models/invoice')
const Customer = require('../models/customer')
const Product = require('../models/product')
const PDFDocument = require('pdfkit');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');

 
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

        return res.status(200).json(product);

    }   
    catch (error) {
        res.redirect('/', errorMessage) // redirect to invoices index page.
    } 
});

// fetch api find product by id route
router.get('/:id/addproductbyid', async (req,res) => {

    try {
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
    const { customer, items, date, shipDate, totalAmount, signature } = req.body; // Destructure the request body
    const invoice = new Invoice({ 
        customer,
        items: items || [], // Initialize items as an empty array
        totalAmount, // Initialize totalAmount
        date: date ? new Date(date) : Date.now(), // Ensure date is a Date object
        shipDate: shipDate ? new Date(shipDate) : Date.now(), // Ensure date is a Date object
        signature: "#"
    });

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

        // Format the dates to YYYY-MM-DD for rendering in the form
        // let formattedDate = invoice.date.toISOString().split('T')[0];  // 'YYYY-MM-DD'
        // let formattedShipDate = invoice.shipDate ? invoice.shipDate.toISOString().split('T')[0] : '';
     
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

// Route to generate PDF
router.get('/:id/pdf', async (req, res) => {
    try {
      // Fetch invoice data from MongoDB
      const invoice = await Invoice.findById(req.params.id)
        .populate('customer')
        .exec();
      
      if (!invoice) {
        return res.status(404).send('Invoice not found');
      }
      
      console.log('Invoice data loaded:', invoice.invoiceNumber);
      console.log('Number of items:', invoice.items.length);
      
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true // Enable page buffering
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      let startY = doc.y;
      // Company header
      doc.fontSize(18).font('Helvetica-Bold').text('51 Trading Inc.');
      doc.fontSize(10).font('Helvetica').text('401 W 220th Street #15');
      doc.text('Carson, CA 90745');
      
      // Invoice header
      doc.y = startY;
      doc.x = 300;
      doc.fontSize(18).font('Helvetica-Bold').text('Invoice', { align: 'right' });
      doc.fontSize(10).font('Helvetica-Bold').text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' });
      doc.text(`Invoice Date: ${invoice.date.toISOString().split('T')[0]}`, { align: 'right' });
      doc.text(`Ship Date: ${invoice.shipDate.toISOString().split('T')[0]}`, { align: 'right' });
      doc.moveDown();
     
      // Bill To and Ship To sections
      let billshipY = doc.y;
      // Bill To
     
      doc.x = 50
      doc.font('Helvetica-Bold').text('Bill to:');
      doc.font('Helvetica')
        .text(invoice.customer.companyName)
        .text(invoice.customer.address.street)
        .text(`${invoice.customer.address.city} ${invoice.customer.address.state}, ${invoice.customer.address.zipcode} ${invoice.customer.address.country}`)
        .text(invoice.customer.phoneNumber)
        .text(invoice.customer.faxNumber);
      
      // Ship To (positioned to the right)
      doc.y = billshipY;
      doc.x = 410;
      doc.font('Helvetica-Bold').text('Ship to:');
      doc.font('Helvetica')
        .text(invoice.customer.companyName)
        .text(invoice.customer.address.street)
        .text(`${invoice.customer.address.city} ${invoice.customer.address.state}, ${invoice.customer.address.zipcode} ${invoice.customer.address.country}`)
        .text(invoice.customer.phoneNumber)
        .text(invoice.customer.faxNumber);
      
      // Reset position for table
      doc.x = 50;
      doc.moveDown(2);
      
      console.log('Starting table at y position:', doc.y);
      
      // Function to generate barcode
      const generateBarcodeBuffer = async (text) => {
        const canvas = createCanvas(200, 50); // Reduced height
        JsBarcode(canvas, text, {
          format: 'CODE128',
          width: 1.5,
          height: 16, // Shorter barcode height
          displayValue: false, // Remove text display
          margin: 0
        });
        return canvas.toBuffer('image/png');
      };
      
      // Function to draw the table header
      const drawTableHeader = (y) => {
        // Define table layout
        const columnPositions = [50, 110, 300, 400, 440, 500]; // X positions
        
        // Draw table headers
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Item', columnPositions[0], y);
        doc.text('Description', columnPositions[1], y);
        doc.text('Barcode', columnPositions[2], y); // Changed from 'MPN' to 'Barcode'
        doc.text('Qty', columnPositions[3], y);
        doc.text('Price', columnPositions[4], y);
        doc.text('Amount', columnPositions[5], y);
        
        // Draw header line
        doc.moveTo(50, y + 15)
           .lineTo(550, y + 15)
           .stroke();
        
        return y + 25; // Return the new y position
      };
      
      // Function to draw the table footer
      const drawTableFooter = (y) => {
        // Draw footer line
        doc.moveTo(50, y)
           .lineTo(550, y)
           .stroke();
        y += 15;
        
        // Draw table footer
        doc.font('Helvetica').fontSize(8);
        
        // Left side - disclaimer
        doc.text('Customer shall inspect all merchandise immediately upon receipt thereof. All claims for damages or shortages of merchandise, if any must be made in writing on original signed invoice when merchandise is delivered. The total amount of the invoice must be paid in full within 30 days of its invoice date.', 
          50, y, { width: 300 });
        
        // Right side - total amount
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Total Amount: $${parseFloat(invoice.totalAmount).toFixed(2)}`, 
          350, y, { width: 200, align: 'right' });
        
        return y + 40; // Return the new y position
      };
      
      // Define table layout
      const tableTop = doc.y;
      const columnPositions = [50, 110, 300, 400, 440, 500]; // X positions
      
      // Draw initial table header
      let y = drawTableHeader(tableTop);
      
      // Generate barcode buffers in advance to avoid promise issues
      const barcodeBuffers = {};
      for (const item of invoice.items) {
        if (item.mpn) {
          barcodeBuffers[item.mpn] = await generateBarcodeBuffer(item.mpn);
        }
      }
      
      // Draw table rows
      doc.font('Helvetica').fontSize(8);
      for (let index = 0; index < invoice.items.length; index++) {
        const item = invoice.items[index];
        console.log(`Drawing row ${index+1}:`, item.itemNumber);
        
        // Calculate row height including barcode
        const textHeight = doc.heightOfString(item.description, { width: 200 });
        const rowTextHeight = Math.max(textHeight, 12);
        const barcodeHeight = 16; // Height for barcode
        
        // Check if we need a new page
        if (y + rowTextHeight > 700) {
          // Draw footer on current page
          drawTableFooter(y);
          
          // Add a new page
          doc.addPage();
          y = 50;
          
          // Draw header on new page
          y = drawTableHeader(y);
        }
        
        // Draw row data
        doc.font('Helvetica').fontSize(8);
        doc.text(item.itemNumber, columnPositions[0], y);
        doc.text(item.description, columnPositions[1], y, { width: 200 });
        
        // Instead of text MPN, display barcode directly
        if (item.mpn && barcodeBuffers[item.mpn]) {
          doc.image(barcodeBuffers[item.mpn], columnPositions[2], y, { width: 80 });
        }
        
        doc.text(item.quantity.toString(), columnPositions[3], y);
        doc.text(`$${parseFloat(item.price).toFixed(2)}`, columnPositions[4], y);
        doc.text(`$${parseFloat(item.subTotal).toFixed(2)}`, columnPositions[5], y);
        
        // Move to next row, accounting for text height or barcode height, whichever is larger
        y += Math.max(rowTextHeight, barcodeHeight);
      }
      
      console.log('Table complete, drawing footer at y position:', y);
      
      // Draw final footer if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      
      y = drawTableFooter(y);
      
      // Add signature if exists
      if (invoice.signature) {
        y += 20;
        doc.fontSize(10).text('Customer Signature:', 50, y);
        y += 15;
        
        // Convert data URL to image
        if (invoice.signature.startsWith('data:image')) {
          const signatureData = invoice.signature.split(',')[1];
          doc.image(Buffer.from(signatureData, 'base64'), 50, y, { width: 200 });
        }
      }
      
      console.log('PDF generation complete');
      
      // Finalize the PDF
      doc.end();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF: ' + error.message);
    }
  });

// In your invoice routes file
router.post('/:id/copy', async (req, res) => {
    try {
      // Find the original invoice
      const originalInvoice = await Invoice.findById(req.params.id);
      
      
      if (!originalInvoice) {
        return res.status(404).json({ message: "Original invoice not found" });
      }
  
      // Create new invoice with copied items but new invoice number
      const newInvoice = new Invoice({
        customer: req.body.customer || originalInvoice.customer, // Allow new customer or keep original
        items: originalInvoice.items, // Copy all items
        totalAmount: originalInvoice.totalAmount,
        // Invoice number will be auto-generated by the middleware
      });
  
    //   // Save the new invoice
      const savedInvoice = await newInvoice.save();
    //   console.log(originalInvoice);
      res.status(201).json(newInvoice);
  
    } catch (error) {
      res.status(400).json({ message: error.message });
      console.log(error);
    }
  });

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
            itemNumber: item.itemNumber,
            // productId: item.productId,
            description: item.description,
            quantity: parseInt(item.quantity, 10),
            price: parseFloat(item.price), 
            subTotal: parseFloat(item.subTotal),
            status: item.status
        }));

        invoice.customer = req.body.customer;
        // invoice.date = req.body.date;
        invoice.date = req.body.date ? new Date(req.body.date) : Date.now(); // Ensure date is a Date object
        invoice.shipDate = req.body.shipDate ? new Date(req.body.shipDate) : Date.now(); // Ensure date is a Date object
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



