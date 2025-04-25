import express from "express";
import {
  registeruser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,paymentStripe,verifyStripe
} from "../controllers/usercontroller.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userrouter = express.Router();
userrouter.post("/login", loginUser);

userrouter.post("/register", registeruser);
userrouter.get("/get-profile", authUser, getProfile);
userrouter.post("/update-profile",upload.single('image'),authUser, updateProfile);
userrouter.post('/book-appointment',authUser,bookAppointment)
userrouter.get('/appointments',authUser,listAppointments)
userrouter.post('/cancel-appointment',authUser,cancelAppointment)
userrouter.post("/payment", authUser, paymentStripe)
userrouter.post("/verify", authUser, verifyStripe)

export default userrouter;
