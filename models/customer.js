const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    address: {
        street: {
            type: String,
            required:true
        },
        city: {
            type: String,
            required:true
        },
        zipcode: {
            type: String,
            required:true
        },
        state: {
            type: String,
            required:true
        },
        country: {
            type: String,
            required:true
        },
    },
    phoneNumber: {
        type: String,
        requred: true
    },
    faxNumber: {
        type: String,
        requred: false
    },
    email: {
        type: String,
        required: false,
        lowercase: true,
    },
})

module.exports = mongoose.model('Customer', customerSchema)