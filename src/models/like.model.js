import mongoose from "mongoose";
const likeSchema = new mongoose.Schema(
    {
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            default: null
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
            default: null
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true } // createdAt + updatedAt
);
export const Like = mongoose.model("Like", likeSchema);
