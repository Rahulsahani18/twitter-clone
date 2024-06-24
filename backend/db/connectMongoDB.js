import mongoose from "mongoose"; // Importing the mongoose library

const connectMongoDB = async () => { // Defining the connectMongoDB function
	try {
		// Getting the MongoDB URI from environment variables or using a default URI
		const uri = process.env.MONGO_URI || 'mongodb+srv://rs7613718:Rahul1818@e-commerce-database.lejz8av.mongodb.net/twiter';
		
		console.log(uri); // Logging the MongoDB URI
		
		// Connecting to the MongoDB database using the URI
		const conn = await mongoose.connect(uri);
		
		// Logging a message indicating successful connection to MongoDB
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		// Logging an error message if connection to MongoDB fails
		console.error(`Error connection to mongoDB: ${error.message}`);
		
		// Exiting the process with a non-zero exit code to indicate failure
		process.exit(1);
	}
};

export default connectMongoDB; // Exporting the connectMongoDB function
