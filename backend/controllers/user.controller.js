import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Controller function to get user profile by username
export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password"); // Find user by username and exclude password from response
		if (!user) return res.status(404).json({ message: "User not found" }); // Return error if user not found

		res.status(200).json(user); // Respond with user profile
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message); // Log the error
		res.status(500).json({ error: error.message }); // Return internal server error if something goes wrong
	}
};

// Controller function to follow/unfollow a user
export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id); // Find user to modify
		const currentUser = await User.findById(req.user._id); // Find current user

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" }); // Return error if trying to follow/unfollow self
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" }); // Return error if user not found

		const isFollowing = currentUser.following.includes(id); // Check if current user is already following the user

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // Remove current user from followers of the user
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); // Remove user from following list of current user

			res.status(200).json({ message: "User unfollowed successfully" }); // Respond with success message
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); // Add current user to followers of the user
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // Add user to following list of current user

			const newNotification = new Notification({ // Create notification for user follow
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save(); // Save the notification to the database

			res.status(200).json({ message: "User followed successfully" }); // Respond with success message
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message); // Log the error
		res.status(500).json({ error: error.message }); // Return internal server error if something goes wrong
	}
};

// Controller function to get suggested users
export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id; // Get current user ID

		const usersFollowedByMe = await User.findById(userId).select("following"); // Get users followed by current user

		const users = await User.aggregate([ // Get a random sample of users
			{
				$match: {
					_id: { $ne: userId }, // Exclude current user
				},
			},
			{ $sample: { size: 10 } }, // Random sample of 10 users
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id)); // Filter out users already followed by the current user
		const suggestedUsers = filteredUsers.slice(0, 4); // Get the first 4 suggested users

		suggestedUsers.forEach((user) => (user.password = null)); // Exclude password field from suggested users

		res.status(200).json(suggestedUsers); // Respond with suggested users
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message); // Log the error
		res.status(500).json({ error: error.message }); // Return internal server error if something goes wrong
	}
};

// Controller function to update user profile
export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body; // Extract fields from request body
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id; // Get current user ID

	try {
		let user = await User.findById(userId); // Find user by ID
		if (!user) return res.status(404).json({ message: "User not found" }); // Return error if user not found

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" }); // Return error if one of the passwords is missing
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password); // Compare current password with hashed password
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" }); // Return error if current password is incorrect
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" }); // Return error if new password is too short
			}

			const salt = await bcrypt.genSalt(10); // Generate salt for password hashing
			user.password = await bcrypt.hash(newPassword, salt); // Hash the new password
		}

		if (profileImg) {
			if (user.profileImg) {
				
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); // Delete previous profile image from cloudinary
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg); // Upload new profile image to cloudinary
			profileImg = uploadedResponse.secure_url; // Get secure URL of uploaded profile image
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]); // Delete previous cover image from cloudinary
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg); // Upload new cover image to cloudinary
			coverImg = uploadedResponse.secure_url; // Get secure URL of uploaded cover image
		}

		// Update user fields with new values
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save(); // Save updated user to database

		// password should be null in response
		user.password = null;

		return res.status(200).json(user); // Respond with updated user profile
	} catch (error) {
		console.log("Error in updateUser: ", error.message); // Log the error
		res.status(500).json({ error: error.message }); // Return internal server error if something goes wrong
	}
};
