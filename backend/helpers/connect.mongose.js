import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();


export default async connectDB => {
    try {
        await mongoose.connect(process.env.MONGO_URI,);
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}