// src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// create app
const app = express();

// CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// ⚠️ IMPORT ROUTES BEFORE BODY PARSERS
import userRouter from "./routes/user.routes.js";

// ⚠️ IMPORTANT: mount routes BEFORE body parsers
app.use("/api/v1/users", userRouter);

// Body parsers (after multer routes)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());

export { app };
