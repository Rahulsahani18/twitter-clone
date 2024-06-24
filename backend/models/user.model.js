import mongoose from "mongoose";

// Define the schema for users
const userSchema = new mongoose.Schema(
	{
		// Unique username for each user
		username: {
			type: String,
			required: true, // This field is required
			unique: true, // Username must be unique
		},
		// Full name of the user
		fullName: {
			type: String,
			required: true, // This field is required
		},
		// Password for user authentication
		password: {
			type: String,
			required: true, // This field is required
			minLength: 6, // Minimum length of the password is 6 characters
		},
		// Email address of the user
		email: {
			type: String,
			required: true, // This field is required
			unique: true, // Email must be unique
		},
		// Array of user IDs who follow this user
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User", // Reference to the User model
				default: [], // Default value is an empty array
			},
		],
		// Array of user IDs whom this user follows
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User", // Reference to the User model
				default: [], // Default value is an empty array
			},
		],
		// URL of the user's profile image
		profileImg: {
			type: String,
			default: "", // Default value is an empty string
		},
		// URL of the user's cover image
		coverImg: {
			type: String,
			default: "", // Default value is an empty string
		},
		// Biography or description of the user
		bio: {
			type: String,
			default: "", // Default value is an empty string
		},
		// Link associated with the user (e.g., website)
		link: {
			type: String,
			default: "", // Default value is an empty string
		},
		// Array of post IDs liked by the user
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post", // Reference to the Post model
				default: [], // Default value is an empty array
			},
		],
	},
	{ timestamps: true } // Include timestamps for createdAt and updatedAt
);

// Create the User model based on the schema
const User = mongoose.model("User", userSchema);

// Export the User model
export default User;
