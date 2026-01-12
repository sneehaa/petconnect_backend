// importing
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;


const app = express();


dotenv.config();


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions))


connectDB();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.get("/test", (req,res) => {
    res.status(200).send("Hello");
})


app.use('/api/payments', require('./routes/payment.routes'))


const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})

// exporting app
module.exports = app;