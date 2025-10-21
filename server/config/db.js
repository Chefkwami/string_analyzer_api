import mongoose from "mongoose";


const connectToDB = async() => {

    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Mongodb is not defined in environment variables")
        }

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("MongoDB connected Successfully")

    } catch (error) {
        console.log("MongoDB connection failed ")
        process.exit(1)

    }

}

export default connectToDB