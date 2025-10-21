import mongoose from "mongoose";


const connectToDB = async() => {

    try {

        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected Successfully")

    } catch (error) {
        console.log("MongoDB connection failed ")
        process.exit(1)

    }

}

export default connectToDB