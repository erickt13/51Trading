const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    npm: {
        type: String,
        required: true
    },
    itemNumber: {
        type: Number,
        required:true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }

})

module.exports = mongoose.model('Product', productSchema)