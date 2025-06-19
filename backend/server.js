import express from 'express'
import cors from 'cors'
import 'dotenv/config';
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudnary.js';
import adminrouter from './routes/adminroute.js';
import doctorModel from "./models/doctorModel.js"; // change path if needed
import dotenv from "dotenv";
import doctorRouter from './routes/doctorroute.js';
import userrouter from './routes/userroute.js';

dotenv.config();
//app config
const app=express()

const port=process.env.PORT || 4000

connectDB()
connectCloudinary()


//middlewares use krre 
app.use(express.json())

app.use(cors())


//api endpoints
app.use('/api/admin',adminrouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userrouter)

app.get('/',(req,res)=>{
    res.send('api working is great')
})
// const addAvailabilityToAll = async () => {
//     try {
//       const result = await doctorModel.updateMany(
//         { available: { $exists: false } },
//         { $set: { available: true } }
//       );
//       console.log(`✅ Updated ${result.modifiedCount} doctors`);
//     } catch (err) {
//       console.error("❌ Error updating doctors:", err);
//     }
//   };
  // call it during server start

app.listen(port,()=> console.log("server started",port) );


