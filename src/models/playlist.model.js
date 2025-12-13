import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,   // ✔ Correct
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true    // ✔ Correct
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
