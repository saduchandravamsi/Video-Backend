// src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// ✅ Body parsers MUST be here BEFORE routes
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Now mount routes AFTER body parser
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

export { app };
