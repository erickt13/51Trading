const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    mpn: {
        type: String,
        required: false
    },
    itemNumber: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: false
    },
    crvTier: {
        type: String,       // 'low' ($0.05) or 'high' ($0.10)
        enum: ['low', 'high'],
        required: false
    },
    unitCount: {
        type: Number,       // e.g. 24
        required: false
    }
})

module.exports = mongoose.model('Product', productSchema)