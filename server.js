import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectToDB from "./server/config/db.js";
import analysisRouter from "./server/routes/analyzeRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ credentials: true }));
connectToDB();

app.use("/strings", analysisRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on localhost://${PORT}`);
});