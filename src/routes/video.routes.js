import { router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"
import {
    publishAVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
const router = Router();
router.use(verifyJWT);


//public routes
router.get("/", getAllVideos);

// Get one video
router.get("/:videoId", getVideoById);

//protected Routes
router.route("/").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },

    ]),
    publishAVideo
);
// Update video
router.patch(
    "/:videoId",
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
);

// Delete video
router.delete(
    "/:videoId",
    verifyJWT,
    deleteVideo
);

// Toggle publish status
router.patch(
    "/toggle/publish/:videoId",
    verifyJWT,
    togglePublishStatus
);


export default router;