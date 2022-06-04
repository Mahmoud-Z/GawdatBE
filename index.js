//In this main page we define and require the packages that we will need in our ptoject 
// first we define the express becouse it helps us to handle the http requests
const express=require('express');
//we use cors that we allow other apps to access our API 
var cors = require('cors')
//we use the body parser to handle buffer data
const bodyparser = require('body-parser');
//that package helps us to set shared folder path in our project
const path=require('path');
const app=express();
app.use(cors())
//we use body parser to handle the APIs becouse it came in json form 
app.use(bodyparser.json())
//to handle buffer
app.use(express.urlencoded({extended:true}));
//call the route that have all functionality
app.use(require('./routes/links.routes'));
//define the port that our application will use to work on
app.listen(process.env.PORT||5000,()=>{
    console.log("server is running");
});