const mongoose = require('mongoose')

const crvRateSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'current' },
    lowRate: { type: Number, required: true, default: 0.05 },
    highRate: { type: Number, required: true, default: 0.10 }
})

module.exports = mongoose.model('CrvRate', crvRateSchema)