import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";

const router = Router();

router
    .route("/toggle/:channelId")
    .post(verifyJWT, toggleSubscription);
router
    .route("/channel/:channelId/subscribers")
    .get(verifyJWT, getUserChannelSubscribers);
router
    .route("/user/:subscriberId/subscribed")
    .get(verifyJWT, getSubscribedChannels);

export default router;
