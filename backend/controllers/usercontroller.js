//api to register user
import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import stripe from "stripe";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import { useNavigate, useParams } from "react-router-dom";


const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)


const registeruser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "missing details" });
    }
    //validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }
    //validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password" });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    const userData = {
      name,
      email,
      password: hashedpassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api for a user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user doesnot exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "invailid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.json({ success: false, message: "user not found" });
    }
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    if (!name || !phone || !address || !dob || !gender) {
      return res.json({ success: false, message: "missing details" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      //upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, {
        image: imageUrl,
      });
    }
    res.json({ success: true, message: "profile updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to book appointment
const bookAppointment = async (req, res) => {

  try {

      const { userId, docId, slotDate, slotTime } = req.body
      const docData = await doctorModel.findById(docId).select("-password")

      if (!docData.available) {
          return res.json({ success: false, message: 'Doctor Not Available' })
      }

      let slots_booked = docData.slots_booked;
    console.log(typeof slots_booked);
    
      
      // checking for slot availablity 
      if (slots_booked[slotDate]) {
          if (slots_booked[slotDate].includes(slotTime)) {
              return res.json({ success: false, message: 'Slot Not Available' })
          }
          else {
            
            
              slots_booked[slotDate].push(slotTime)
          }
      } else {  
        
        
          slots_booked[slotDate] = []
          slots_booked[slotDate].push(slotTime)
      }


      const userData = await userModel.findById(userId).select("-password")

      delete docData.slots_booked

      const appointmentData = {
          userId,
          docId,
          userData,
          docData,
          amount: docData.fees,
          slotTime,
          slotDate,
          date: Date.now()
      }
      const newAppointment = new appointmentModel(appointmentData);

      await newAppointment.save()

      // save new slots data in docData
      await doctorModel.findByIdAndUpdate(docId, { slots_booked })
      
      res.json({ success: true, message: 'Appointment Booked' })

  } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
  }

}


// api to get all appointments of a user
const listAppointments = async (req, res) => {
    try {
        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
  }


  const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

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

//api to make payment of appointment using stripe
const paymentStripe = async (req, res) => {
  try { 
    const { appointmentId } = req.body;
    const { origin } = req.headers;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: 'Appointment Cancelled or not found' });
    }

    const currency = process.env.CURRENCY.toLowerCase();

    // ✅ Enforce minimum ₹50 => 5000 paise
    const minAmountINR = 50;
    const amountINR = Math.max(appointmentData.amount, minAmountINR);
    const unitAmount = amountINR * 100; // Stripe expects paise

    console.log("Charging:", unitAmount, currency);

    const line_items = [{
      price_data: {
        currency,
        product_data: {
          name: "Appointment Fees"
        },
        unit_amount: unitAmount
      },
      quantity: 1
    }];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
      cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
      line_items,
      mode: 'payment',
    });
    
  
    
    res.json({ success: true, session_url: session.url });
    
  
    

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}







const verifyStripe = async (req, res) => {
  try {
   console.log("hii");
   
      const { appointmentId, success } = req.body
      

      if (success === "true") {
          await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
          return res.json({ success: true, message: 'Payment Successful' })
      }

      res.json({ success: false, message: 'Payment Failed' })

  } catch (error) {
      console.log(error)
      res.json({ success: false, message: error.message })
  }

}


export { registeruser, loginUser, getProfile,updateProfile,bookAppointment,listAppointments,cancelAppointment,paymentStripe,verifyStripe };
