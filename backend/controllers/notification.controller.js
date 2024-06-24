import Notification from "../models/notification.model.js"; // Import Notification model

// Controller function to get notifications for the current user
export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id; // Get the user ID from the request

		// Find notifications for the current user and populate the 'from' field with username and profileImg
		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		// Update all notifications for the user to mark them as read
		await Notification.updateMany({ to: userId }, { read: true });

		// Respond with the notifications
		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

// Controller function to delete all notifications for the current user
export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id; // Get the user ID from the request

		// Delete all notifications for the current user
		await Notification.deleteMany({ to: userId });

		// Respond with success message
		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
