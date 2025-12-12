import mongoose from "mongoose";
import { ApiError } from "../utils/ApiErrors";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";

//get all the videos
/*
get all the videos in the video-site
we will define the pagination parameter 
{concept : 
   pagination for suppose user got 1st 10 videos in the screen 
   next 10 video will be seen using offset and limit ,every id is stored in b+tree, 
   (!Now a days using cusour based pagination ,  it will store the last id of the current page , and using B+ tree i will search the next id and instead of search id from starting , we will store it and we will search it using tree traverse)
}
*/
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        limit = 10,
        cursor,
        query,
        sortBy = "_id",
        sortType = "asc",
        userId
    } = req.query;
    const limitNumber = Number(limit);
    const filter = {};
    // Search (title + description)
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }
    // Filter by user
    if (userId) {
        filter.owner = userId;
    }
    // Cursor condition
    if (cursor) {
        filter._id = { $gt: cursor };
    }
    ///here because of using cursor based paggination we dont need to skip the before seen pages
    // Sorting
    const sortOption = {};
    sortOption[sortBy] = sortType === "asc" ? 1 : -1;

    // Fetch videos
    const videos = await Video.find(filter)
        .sort(sortOption)
        .limit(limitNumber)
        .populate("owner", "fullName username avatar")
        .select("-__v");

    // Determine next cursor
    const nextCursor =
        videos.length > 0 ? videos[videos.length - 1]._id : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                nextCursor,  // FRONTEND USES THIS TO FETCH NEXT PAGE
                hasNextPage: nextCursor ? true : false
            },
            "Videos fetched successfully"
        )
    );
});

//User to publish a video
/**  steps to publish a video 
 * check the feilds are there or not if not give error
 * get the video path and thumbnail path 
 * if video not available throw error
 * get the duration of the video using cloudinary return path and data
 * post in the Database Video model
*/
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required");
    }
    const videoFilePath = req.files?.video?.[0]?.path;
    if (!videoFilePath) {
        throw new ApiError(400, "Video file is required");
    }
    const videoFile = await uploadOnCloudinary(videoFilePath);
    if (!videoFile || !videoFile.url) {
        throw new ApiError(500, "Error uploading video");
    }
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;
    let thumbnailUrl = "";
    if (thumbnailPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailPath);
        thumbnailUrl = thumbnail?.url || "";
    }
    const duration = videoFile?.duration || 0;
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnailUrl,
        duration,
        owner: req.user._id
    });
    return res.status(201).json(
        new ApiResponse(
            200,
            video,
            "Video published successfully")
    );
});


const updateVideo = asyncHandler(async (req, res) => {
    const { updatedTitle, updatedDescription } = req.body
    if (!updatedTitle && !updatedDescription && !req.file?.path) {
        throw new ApiError(400, "Fields are empty")
    }

    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(400, "video ID is required")
    }

    let thumbnailUrl = "";
    const thumbnailPath = req.file?.path
    if (thumbnailPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailPath)
        if (!thumbnail?.url) {
            throw new ApiError(400, "Error while uploading thumbnail")
        }
        thumbnailUrl = thumbnail.url;
    }

    //To update the fields it is not nesessary to change all the fields ,
    // when ever directly updateding the data , it will be undefined so we will create the object and
    //going to write if updated method

    const updateData = {};
    if (updatedTitle) updateData.title = updatedTitle;
    if (updatedDescription) updateData.description = updatedDescription;
    if (thumbnailUrl) updateData.thumbnail = thumbnailUrl;

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateData
        },
        {
            new: true
        }
    )
    if (!video) {
        throw new ApiError(404, "video update failed or not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video details changes sucessfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    // Authorization check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }
    // Delete Thumbnail from Cloudinary
    if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId);
    }
    // Delete Video File from Cloudinary
    if (video.videoFilePublicId) {
        await deleteFromCloudinary(video.videoFilePublicId);
    }
    //  We will do cascade delete here because if we delete the video for video collection , 
    // the reference object might be the in other tables like comment , like , playlist, 
    //watch histoy
    //to remove the dealId , or null 
    //We will use the cascade delete.
    // 1. Delete Likes
    await Like.deleteMany({ videoId });
    // 2. Delete Comments
    await Comment.deleteMany({ videoId })
    // 3. Remove from all Playlists
    await Playlist.updateMany(
        {},
        { $pull: { videos: videoId } }
    );
    // 4. Remove from all Watch Histories
    await User.updateMany(
        {},
        { $pull: { watchHistory: videoId } }
    );
    // 5. Finally delete the video document
    await Video.findByIdAndDelete(videoId);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video and related data deleted successfully"
            )
        );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    // Fetch video
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Authorization: Only owner can toggle publish
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this video");
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            { isPublished: video.isPublished },
            `Video ${video.isPublished ? "published" : "unpublished"} successfully`
        )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    // Fetch video
    const video = await Video.findById(videoId)
        .populate("owner", "fullName username avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    //  Increase view count
    video.views = (video.views || 0) + 1;
    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});
export {
    getAllVideos,
    updateVideo,
    publishVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoById
}