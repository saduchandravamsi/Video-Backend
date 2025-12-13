// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Load Cloudinary config from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 */
export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        fs.unlinkSync(localFilePath); // remove local file
        return response;

    } catch (error) {
        console.log("Cloudinary upload error:", error);

        try { fs.unlinkSync(localFilePath); } catch (err) { }
        return null;
    }
};


/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID to delete
 * @param {string} resourceType - "image" | "video" | "raw"
 */
export const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
    try {
        if (!publicId) return false;

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return result;
    } catch (error) {
        console.log("Cloudinary delete error:", error);
        return false;
    }
};
