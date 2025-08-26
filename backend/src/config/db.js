import mongoose from "mongoose";

function logMongoDetails(label) {
	const { host, name, port, user } = mongoose.connection;
	console.log(`${label}:`, { host, db: name, port, user: user || undefined });
}

export const connectDB = async () => {
	const mongoUri = "mongodb+srv://new1:new1@c0.emv28pd.mongodb.net/atsen?retryWrites=true&w=majority&appName=C0";

	try {
		await mongoose.connect(mongoUri);
		console.log("MongoDB connected to Atlas");
		logMongoDetails("Mongo connection");
	} catch (error) {
		console.error("MongoDB Atlas connection failed:", error?.message || error);
		console.error("Starting in DEMO mode without a database connection.");
		global.__ATSEN_DEMO_NO_DB__ = true;
		return; // Do not exit; run in demo/no-DB mode
	}
};
