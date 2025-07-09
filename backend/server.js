import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudnary.js';
import adminrouter from './routes/adminroute.js';
import doctorModel from "./models/doctorModel.js"; // change path if needed
import dotenv from "dotenv";
import doctorRouter from './routes/doctorroute.js';
import userrouter from './routes/userroute.js';

dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to DB and Cloudinary
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());

// ✅ Updated CORS setup for multiple frontend URLs
app.use(cors({
  origin: "https://drconsult.vercel.app",

  credentials: true
}));

// API endpoints
app.use('/api/admin', adminrouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userrouter);

// Test route
app.get('/', (req, res) => {
  res.send('API working is great');
});

// Start server
app.listen(port, () => console.log("Server started on port", port));
