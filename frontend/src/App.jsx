import React from "react";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Verify from "./pages/verify.jsx"; 

function App() {
  return (
    <div className="mx-10 sm:mx[10%]">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/MyAppointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
