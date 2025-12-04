// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Load Cloudinary config from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No file path provided to Cloudinary uploader.");
            return null;
        }

        // Upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Remove local file
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Try to remove local file even on error
        try {
            fs.unlinkSync(localFilePath);
        } catch (err) { }

        return null;
    }
};
