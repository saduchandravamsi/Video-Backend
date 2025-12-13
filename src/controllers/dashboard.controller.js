import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    //Total videos + views
    const videoStats = await Video.aggregate([
        { $match: { owner: channelId } },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalVideos = videoStats[0]?.totalVideos || 0;
    const totalViews = videoStats[0]?.totalViews || 0;

    //Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        owner: channelId
    });

    //Total likes ONLY on creator's videos 
    const creatorVideos = await Video.find({ owner: channelId }).select("_id");
    const videoIds = creatorVideos.map(v => v._id);

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    );
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    const { cursor, limit = 10 } = req.query;

    const filter = { owner: channelId };

    if (cursor) {
        filter._id = { $gt: cursor };
    }

    const videos = await Video.find(filter)
        .sort({ _id: 1 })
        .limit(Number(limit))
        .populate("owner", "fullName username avatar");

    const nextCursor =
        videos.length > 0 ? videos[videos.length - 1]._id : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                nextCursor,
                hasNextPage: !!nextCursor
            },
            "Channel videos fetched successfully"
        )
    );
});


export {
    getChannelStats,
    getChannelVideos
}