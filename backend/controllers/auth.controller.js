import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js"; // Import function to generate token and set cookie
import User from "../models/user.model.js"; // Import User model
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

// Controller function for user signup
export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body; // Extract user details from request body

		// Regular expression to validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if username is already taken
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		// Check if email is already registered
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		// Generate salt and hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create a new user instance with hashed password
		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		// Save the new user to the database
		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res); // Generate token and set cookie
			await newUser.save(); // Save user to database

			// Respond with user details (excluding password)
			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Controller function for user login
export const login = async (req, res) => {
	try {
		const { username, password } = req.body; // Extract username and password from request body

		// Find user by username
		const user = await User.findOne({ username });
		// Compare password hash
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		// Check if user exists and password is correct
		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res); // Generate token and set cookie

		// Respond with user details (excluding password)
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Controller function for user logout
export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 }); // Clear JWT cookie
		res.status(200).json({ message: "Logged out successfully" }); // Respond with success message
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Controller function to get current user details
export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password"); // Find user by ID and exclude password
		res.status(200).json(user); // Respond with user details
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
