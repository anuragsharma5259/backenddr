import jwt from "jsonwebtoken";

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    let atoken;

    const stringToken = req.headers.authorization;

    if (!stringToken) {
      // Fallback: try getting `atoken` directly from custom header
      atoken = req.headers.atoken;
    } else {
      // If using Bearer token format: "Bearer <token>"
      atoken = stringToken.split(" ")[1];
    }

    if (!atoken) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    // Check if token payload matches admin credentials
    const expectedPayload = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;

    if (token_decode !== expectedPayload) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    next();
  } catch (error) {
    console.log("Admin Auth Error:", error);
    res.json({ success: false, message: error.message });
  }
};

export default authAdmin;
