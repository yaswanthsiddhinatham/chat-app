// const express = require("express");
import express, { application } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
    connectDB()
});