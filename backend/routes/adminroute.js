import express from'express'

import authAdmin from '../middlewares/authAdmin.js';
import { addDoctor,allDoctors,loginAdmin,appointmentsAdmin ,cancelAppointment,adminDashboard} from '../controllers/admincontroller.js';
import {changeAvailablity} from '../controllers/doctorcontroller.js'

import upload from '../middlewares/multer.js'


const adminrouter=express.Router()

adminrouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)

adminrouter.post('/login',loginAdmin)
adminrouter.post('/all-doctors',authAdmin,allDoctors)
adminrouter.post("/change-availability", authAdmin,changeAvailablity)
adminrouter.get('/appointments',authAdmin,appointmentsAdmin)
adminrouter.post('/cancel-appointment',authAdmin,cancelAppointment)
adminrouter.get('/dashboard',authAdmin,adminDashboard)
export default adminrouter;