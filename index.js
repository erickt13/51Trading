if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// mongoose.set('strictQuery', false)


// mongoose.connect(process.env.DATABASE_URL, {
//     })
//     const db = mongoose.connection
//     db.on('error', error => console.error(error))
//     db.once('open', () => console.log('Connected to mongoose'))

// app.use('/', indexRouter)


// require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.json()); //body parser part code app.use(bodyparser.json()); //utilizes the body-parser package
app.use(express.urlencoded()); //body parser part code - replaces app.use(bodyParser.urlencoded({extended: true}));
const PORT = process.env.PORT || 3000
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')
const productRouter = require('./routes/products') 

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout') 
app.use(expressLayouts)
app.use(express.static('public'))

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

//Routes go here
app.use('/', indexRouter)
app.use('/products', productRouter)

//Connect to the database before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})
   
