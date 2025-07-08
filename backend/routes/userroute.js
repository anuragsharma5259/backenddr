import express from "express";
import {
  registeruser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  paymentStripe,
  verifyStripe,
  sendOTP,
  verifyAndRegisterUser
} from "../controllers/usercontroller.js";

import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userrouter = express.Router();

// OTP-based registration routes
userrouter.post("/send-otp", sendOTP); // step 1: send OTP
userrouter.post("/verify-otp", verifyAndRegisterUser); // step 2: verify OTP + register

// Standard auth routes
userrouter.post("/login", loginUser);
userrouter.post("/register", registeruser); // fallback or non-OTP route

// Profile routes
userrouter.get("/get-profile", authUser, getProfile);
userrouter.post("/update-profile", upload.single("image"), authUser, updateProfile);

// Appointment routes
userrouter.post("/book-appointment", authUser, bookAppointment);
userrouter.get("/appointments", authUser, listAppointments);
userrouter.post("/cancel-appointment", authUser, cancelAppointment);

// Payment routes
userrouter.post("/payment", authUser, paymentStripe);
userrouter.post("/verify", authUser, verifyStripe);

export default userrouter;
