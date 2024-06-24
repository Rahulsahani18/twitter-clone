import mongoose from "mongoose";

// Define the schema for notifications
const notificationSchema = new mongoose.Schema(
	{
		// Reference to the user who triggered the notification
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to the User model
			required: true, // This field is required
		},
		// Reference to the user who should receive the notification
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to the User model
			required: true, // This field is required
		},
		// Type of the notification (e.g., follow or like)
		type: {
			type: String,
			required: true, // This field is required
			enum: ["follow", "like"], // Enumerated values allowed: follow or like
		},
		// Indicates whether the notification has been read
		read: {
			type: Boolean,
			default: false, // Default value is false
		},
	},
	{ timestamps: true } // Include timestamps for createdAt and updatedAt
);

// Create the Notification model based on the schema
const Notification = mongoose.model("Notification", notificationSchema);

// Export the Notification model
export default Notification;
