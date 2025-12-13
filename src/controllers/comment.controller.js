//get video comments 
// add comment
// delete comment 
//update comment

import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { cursor, limit = 10 } = req.query;
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const filter = { video: videoId };
    if (cursor) {
        filter._id = { $git: cursor };
    }
    const comments = await comment.find(filter)
        .sort({
            _id: 1
        })
        .limit(Number(limit))
        .populate("owner", "fullName username avatar")
    const nextCursor = comments.length > 0
        ? comments[comments.length - 1]._id
        : null;


    return res.status(200)
        .json(
            new ApiResponse(
                200,
                { comments, nextCursor, hasNextPage: !!nextCursor },
                "comments fetched sucessfully"
            )
        );
});
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "comment cannot be empty");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video is not there")
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });
    return res.status(201).json(
        new ApiResponse(
            200,
            comment,
            "comment added sucessfully"
        )
    )

});
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { updatedContent } = req.body;

    if (!updatedContent || updatedContent.trim() === "") {
        throw new ApiError(400, "Updated content cannot be empty");
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Authorization: only owner can update
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.content = updatedContent;
    await comment.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    );
});
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId)
        .populate("video", "owner"); // get video owner

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const loggedInUserId = req.user._id.toString();
    const commentOwnerId = comment.owner.toString();
    const videoOwnerId = comment.video.owner.toString();

    // Permission rules:
    // 1️⃣ User who wrote the comment can delete
    // 2️⃣ Video owner can delete
    if (loggedInUserId !== commentOwnerId && loggedInUserId !== videoOwnerId) {
        throw new ApiError(
            403,
            "You are not allowed to delete this comment"
        );
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    );
});


export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}