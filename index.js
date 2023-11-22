// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }
// require('dotenv').config();

// const express = require('express')
// const app = express()
// const expressLayouts = require('express-ejs-layouts')
// const indexRouter = require('./routes/index')
// const PORT = process.env.PORT || 3000
// app.set('view engine', 'ejs')
// app.set('views', __dirname + '/views')
// app.set('layout', 'layouts/layout') 
// app.use(expressLayouts)
// app.use(express.static('public'))
// const mongoose = require('mongoose')
// mongoose.set('strictQuery', false)

// const connectDB = async () => {
//     try {
//       const conn = await mongoose.connect(process.env.MONGO_URI);
//       console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//       console.log(error); 
//       process.exit(1);
//     }
//   }
// mongoose.connect(process.env.DATABASE_URL, {
//     })
//     const db = mongoose.connection
//     db.on('error', error => console.error(error))
//     db.once('open', () => console.log('Connected to mongoose'))

// app.use('/', indexRouter)

// app.listen(PORT)

// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log("listening for requests");
//     })
// })

require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 3000
const expressLayouts = require('express-ejs-layouts')
const indexRouter = require('./routes/index')
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

//Connect to the database before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})
   
