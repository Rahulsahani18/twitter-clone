import Notification from "../models/notification.model.js"; // Import Notification model
import Post from "../models/post.model.js"; // Import Post model
import User from "../models/user.model.js"; // Import User model
import { v2 as cloudinary } from "cloudinary"; // Import cloudinary v2

// Controller function to create a new post
export const createPost = async (req, res) => {
	try {
		const { text } = req.body; // Extract text from request body
		let { img } = req.body; // Extract img from request body
		const userId = req.user._id.toString(); // Get user ID from request

		const user = await User.findById(userId); // Find user by ID
		if (!user) return res.status(404).json({ message: "User not found" }); // Return error if user not found

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img); // Upload image to cloudinary
			img = uploadedResponse.secure_url; // Get secure URL of the uploaded image
		}

		const newPost = new Post({ // Create a new post instance
			user: userId,
			text,
			img,
		});

		await newPost.save(); // Save the new post to the database
		res.status(201).json(newPost); // Respond with the created post
	} catch (error) {
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
		console.log("Error in createPost controller: ", error); // Log the error
	}
};

// Controller function to delete a post
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id); // Find post by ID
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0]; // Get image ID from URL
			await cloudinary.uploader.destroy(imgId); // Delete image from cloudinary
		}

		await Post.findByIdAndDelete(req.params.id); // Delete post from the database

		res.status(200).json({ message: "Post deleted successfully" }); // Respond with success message
	} catch (error) {
		console.log("Error in deletePost controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};

// Controller function to add a comment on a post
export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body; // Extract comment text from request body
		const postId = req.params.id; // Get post ID from request
		const userId = req.user._id; // Get user ID from request

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId); // Find post by ID

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text }; // Create comment object

		post.comments.push(comment); // Add comment to post
		await post.save(); // Save the updated post

		res.status(200).json(post); // Respond with the updated post
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};

// Controller function to like or unlike a post
export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id; // Get user ID from request
		const { id: postId } = req.params; // Get post ID from request

		const post = await Post.findById(postId); // Find post by ID

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId); // Check if user has already liked the post

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); // Remove user from post likes
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }); // Remove post from user's liked posts

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString()); // Filter out the unliked user
			res.status(200).json(updatedLikes); // Respond with updated likes
		} else {
			// Like post
			post.likes.push(userId); // Add user to post likes
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }); // Add post to user's liked posts
			await post.save(); // Save the updated post

			const notification = new Notification({ // Create notification for post like
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save(); // Save the notification to the database

			const updatedLikes = post.likes; // Get updated likes
			res.status(200).json(updatedLikes); // Respond with updated likes
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};

// Controller function to get all posts
export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find() // Find all posts
			.sort({ createdAt: -1 }) // Sort by creation date descending
			.populate({
				path: "user",
				select: "-password",
			}) // Populate user field, excluding password
			.populate({
				path: "comments.user",
				select: "-password",
			}); // Populate comments' user field, excluding password

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts); // Respond with posts
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};

// Controller function to get liked posts of a user
export const getLikedPosts = async (req, res) => {
	const userId = req.params.id; // Get user ID from request

	try {
		const user = await User.findById(userId); // Find user by ID
		if (!user) return res.status(404).json({ error: "User not found" }); // Return error if user not found

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // Find posts by IDs in user's likedPosts array
			.populate({
				path: "user",
				select: "-password",
			}) // Populate user field, excluding password
			.populate({
				path: "comments.user",
				select: "-password",
			}); // Populate comments' user field, excluding password

		res.status(200).json(likedPosts); // Respond with liked posts
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};

// Controller function to get posts of users that the current user is following
export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id; // Get user ID from request
		const user = await User.findById(userId); // Find user by ID
		if (!user) return res.status(404).json({ error: "User not found" }); // Return error if user not found

		const following = user.following; // Get users that the current user is following

		const feedPosts = await Post.find({ user: { $in: following } }) // Find posts by users in following array
			.sort({ createdAt: -1 }) // Sort by creation date descending
			.populate({
				path: "user",
				select: "-password",
			}) // Populate user field, excluding password
			.populate({
				path: "comments.user",
				select: "-password",
			}); // Populate comments' user field, excluding password

		res.status(200).json(feedPosts); // Respond with feed posts
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};

// Controller function to get posts of a specific user
export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params; // Extract username from request parameters

		const user = await User.findOne({ username }); // Find user by username
		if (!user) return res.status(404).json({ error: "User not found" }); // Return error if user not found

		const posts = await Post.find({ user: user._id }) // Find posts by user ID
			.sort({ createdAt: -1 }) // Sort by creation date descending
			.populate({
				path: "user",
				select: "-password",
			}) // Populate user field, excluding password
			.populate({
				path: "comments.user",
				select: "-password",
			}); // Populate comments' user field, excluding password

		res.status(200).json(posts); // Respond with user's posts
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error); // Log the error
		res.status(500).json({ error: "Internal server error" }); // Return internal server error if something goes wrong
	}
};
