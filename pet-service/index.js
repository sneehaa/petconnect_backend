// index.js (or app.js)

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const countRoutes = require("./routes/count.routes");


const app = express();


dotenv.config();


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// cors config to accept request from frontend
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


// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/pets', require('./routes/pet.routes'))
app.use("/api/pets", countRoutes);



const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})

// exporting app
module.exports = app;

