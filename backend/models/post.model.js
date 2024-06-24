import mongoose from "mongoose";

// Define the schema for posts
const postSchema = new mongoose.Schema(
	{
		// Reference to the user who created the post
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to the User model
			required: true, // This field is required
		},
		// Text content of the post
		text: {
			type: String,
		},
		// URL of the image associated with the post
		img: {
			type: String,
		},
		// Array of user IDs who liked the post
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User", // Reference to the User model
			},
		],
		// Array of comments on the post
		comments: [
			{
				// Text content of the comment
				text: {
					type: String,
					required: true, // This field is required
				},
				// Reference to the user who made the comment
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User", // Reference to the User model
					required: true, // This field is required
				},
			},
		],
	},
	{ timestamps: true } // Include timestamps for createdAt and updatedAt
);

// Create the Post model based on the schema
const Post = mongoose.model("Post", postSchema);

// Export the Post model
export default Post;
