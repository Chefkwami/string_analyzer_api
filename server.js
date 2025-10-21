import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
const PORT = process.env.PORT || 5000;
import connectToDB from "./server/config/db.js";
import analysisRouter from "./server/routes/analyzeRoute.js"



const app = express()



app.use(express.json())
    // app.use(cors({ credentials: true }))
connectToDB();



app.use("/strings", analysisRouter)

app.listen(PORT, () => {
    console.log(`Server running on localhost://${PORT}`)
})