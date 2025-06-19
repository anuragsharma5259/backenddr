import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads/"); // Ensure 'uploads/' directory exists
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });

export default upload;
