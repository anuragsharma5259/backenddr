// api for adding doctor
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import { json } from "express";
import jwt from "jsonwebtoken";
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/usermodel.js'

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      available,
      slots_booked,
    } = req.body;
    const imageFile = req.file; // File from Multer

    // Check for missing details
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Hash doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Ensure an image was uploaded
    if (!imageFile) {
      return res.json({ success: false, message: "Image file is required" });
    }

    //Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url; // Get image URL from Cloudinary
    console.log(imageUrl);

    // Prepare doctor data
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      address: JSON.parse(address),
      experience,
      degree,
      image: imageUrl,
      about,
      fees,
      date: Date.now(),
      speciality,
      available,
      slots_booked,
    };

    // Save doctor to database
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API FPR ADMIN LOGIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
  }
};
const allDoctors=async(req,res)=>{
  try {
    const doctors=await doctorModel.find({}).select('-password')
    res.json({success:true,doctors})
  } catch (error) {
    res.json({ success: false, message: "Invalid credentials" });
  }
}


//api to get alll appointments of a doctor
const appointmentsAdmin=async(req,res)=>{
  try {
    const appointments=await appointmentModel.find({})
    res.json({success:true,appointments})
  } catch (error) {
    console.log(error);
    
    res.json({ success: false, message: "Invalid credentials" });
    
  }
}

//api to cancel appointment
const cancelAppointment = async (req, res) => {
  try {

      const {appointmentId } = req.body
      const appointmentData = await appointmentModel.findById(appointmentId)

      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

      // releasing doctor slot 
      const { docId, slotDate, slotTime } = appointmentData

      const doctorData = await doctorModel.findById(docId)

      let slots_booked = doctorData.slots_booked

      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

      await doctorModel.findByIdAndUpdate(docId, { slots_booked })

      res.json({ success: true, message: 'Appointment Cancelled' })

  } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
  }
}

//api to get dashboard data
const adminDashboard=async(req,res)=>{
  try {
    const doctors=await doctorModel.find({})
    const users=await userModel.find({})
    const appointments=await appointmentModel.find({})
    const dashData={
      doctors:doctors.length,
      patients:users.length,
      appointments:appointments.length,
      latestAppointments:appointments.slice(-5).reverse()
      
    }
    res.json({success:true,dashData})

  } catch (error) {
    console.log(error)
      res.json({ success: false, message: error.message })
  
  }
}
export { addDoctor, loginAdmin,allDoctors,appointmentsAdmin,cancelAppointment,adminDashboard};
