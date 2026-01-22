// importing
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

<<<<<<< HEAD
import express from "express";
import connectDB from "./database/db.js";
import paymentRoutes from "./routes/payment.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import countRoutes from "./routes/count.routes.js"; // ✅ ES Module import

=======
>>>>>>> 4fef8b60fd1a565ebb5ad287c89035cd1fd56a01

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

<<<<<<< HEAD
// Routes
app.use("/payments", paymentRoutes);
app.use("/transactions", transactionRoutes);
app.use("/receipts", receiptRoutes);
app.use("/api/transactions", countRoutes); // ✅ Using imported countRoutes

=======
app.use(express.json());
>>>>>>> 4fef8b60fd1a565ebb5ad287c89035cd1fd56a01

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