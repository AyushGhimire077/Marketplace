import jwt from "jsonwebtoken";
import { userModel, dealerModel } from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify the token and decode it
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user or dealer based on the decoded token
    let user = await userModel.findById(decodedToken.id); // Default to looking for a user
    if (!user) {
      // If the user doesn't exist, try finding a dealer
      user = await dealerModel.findById(decodedToken.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Attach the user or dealer to the request object
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authMiddleware;
