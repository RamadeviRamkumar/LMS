require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./router/routes.js');

const app = express();
app.use(express.json())
app.use('/api',routes)

mongoose.connect(process.env.DB_CONNECTION_STRING, {
    UseNewUrlParser:true,
    UseUnifiedTopology:true
})
const database = mongoose.connection
database.on('error',(err)=>console.log(err))
database.on("connected",()=>console.log('database connected'))
app.listen(3000,()=>{
    console.log("server started on localhost:3000");
})