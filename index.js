const express=require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app=express()
const mongoose=require("mongoose")
const routes=require("./Routes/Route.js")

 require('dotenv').config();

const PORT=2585






 mongoose.set('strictQuery',true);

 const mongoDB ="mongodb+srv://sandeepkadam1798sk:34SxDmuXcJOGlqfU@cluster0.faoughe.mongodb.net/"
mongoose.connect(mongoDB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use("/",routes)

 app.get("/getkey",(req,res)=>{
  res.status(200).json({key:"rzp_test_TylPzNmfBh90e2"})
 })

app.listen(PORT,()=>{
    console.log(`app running on port no ${PORT} `)
})