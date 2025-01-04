const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    mpn: {
        type: String,
        required: false
    },
    itemNumber: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: false
    }
})

module.exports = mongoose.model('Product', productSchema)