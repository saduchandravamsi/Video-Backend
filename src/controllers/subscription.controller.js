// We will have the all the subscribers 
// unscbscribe them 
// getSubscribe details 
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";  // ← FIX THIS
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (req.user._id.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existing = await Subscription.findOne({
        subscriber: req.user._id,
        owner: channelId
    });

    if (existing) {
        await Subscription.findByIdAndDelete(existing._id);
        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
    }

    await Subscription.create({
        subscriber: req.user._id,
        owner: channelId
    });

    return res.status(200).json(
        new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ owner: channelId })
        .populate("subscriber", "fullName username avatar email")
        .select("-owner -__v");

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (req.user._id.toString() !== subscriberId.toString()) {
        throw new ApiError(403, "You cannot view someone else's subscriptions");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("owner", "fullName username avatar email")
        .select("-subscriber -__v");

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};

/*
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    //is channel valid
    //get current userId 
    // user cannot subscribe to their own channel
    //get the details in subscription model and remove the subscribe 
    // user not subscribed subscribe 
    //return response 
    if (!channelId || isValidObject(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    if (req.user._id.toString() === channelId.toString) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "channel not found");
    }
    const existedSub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    if (existedSub) {
        await Subscription.findByIdAndDelete(existedSub._id);
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { subscribed: false },
                "Unsubscribed sucessfully"
            )
            );
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            { subscribed: true },
            "Subscribed successfully"
        )
    );
})
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (isValidObject(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    if (req.user._id.toString() === channelId.toString()) {
        throw new ApiError(400, "You are not allow to see the subscriber list")
    }
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "fullName username avatar email")
        .select("-channel");

    if (!subscribers) {
        throw new ApiError(404, "Data not found")
    }
    return res.status(200)
        .json(
            200,
            subscribers,
            "Detailes fetched sucessfully"
        )
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // 1. Validate subscriber ID
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }
    // 2. Verify that user exists
    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // 3. Only the logged-in user can view their own subscriptions
    if (req.user._id.toString() !== subscriberId.toString()) {
        throw new ApiError(403, "You are not allowed to view subscribed channels of another user");
    }
    // 4. Get all channels the user has subscribed to
    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "fullName username avatar email")
        .select("-subscriber");
    return res.status(200).json(
        new ApiResponse(
            200,
            channels,
            "Subscribed channels fetched successfully"
        )
    );
});
export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}*/