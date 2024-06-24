import User from "../models/user.model.js"; // Importing the User model
import jwt from "jsonwebtoken"; // Importing the jsonwebtoken library

export const protectRoute = async (req, res, next) => { // Defining the protectRoute middleware function
	try {
		const token = req.cookies.jwt; // Extracting JWT token from request cookies
		
		// If no token is provided, return a 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}
         
		// Setting the secret key for JWT token verification
		const secret = process.env.JWT_SECRET || '5jhzbbzOTU8okF43mlAijE4i7+6/lH8Ph4Y0cv8iOMc=';
		
		// Verifying the JWT token
		const decoded = jwt.verify(token, secret);

		// If token verification fails, return a 401 Unauthorized response
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

		// Finding the user associated with the decoded user ID from the token
		const user = await User.findById(decoded.userId).select("-password");

		// If user is not found, return a 404 Not Found response
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Attaching the user object to the request for further processing
		req.user = user;
		next(); // Calling the next middleware or route handler
	} catch (err) {
		console.log("Error in protectRoute middleware", err.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
