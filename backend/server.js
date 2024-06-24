// Import necessary modules
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary"; // Importing cloudinary v2

// Importing route files
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import cors from "cors"; // Cross-Origin Resource Sharing middleware
import connectMongoDB from "./db/connectMongoDB.js"; // MongoDB connection function

dotenv.config(); // Load environment variables from .env file

// Setting up Cloudinary configuration with environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dgttwwiwp';
const apiKey = process.env.CLOUDINARY_API_KEY || '534568789847674';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'S-RzBnsk--SJv6Cd7JEKC4RcKP0';

cloudinary.config({
	cloud_name: cloudName,
	api_key: apiKey,
	api_secret: apiSecret,
});

// Create an Express app
const app = express();
app.use(cors()); // Enable CORS for all routes
const PORT =  process.env.PORT ||5000; // Set the port 
const __dirname = path.resolve(); // Define the current directory

// Middleware to parse JSON and urlencoded data
app.use(express.json({ limit: "5mb" })); // to parse req.body
// Limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser()); // Parse cookies

// Define routes for different endpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve static files in production 
//if (true) {
	app.use(express.static(path.join(__dirname, "/frontend/dist"))); // Serve static files from frontend/dist directory

	// For all other routes, serve index.html from the frontend/dist directory
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
//}

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB(); // Connect to MongoDB
});
