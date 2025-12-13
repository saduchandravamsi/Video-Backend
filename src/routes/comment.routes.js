import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

const router = Router();
//Get all comments for a video (public or protected?)
// If you want only logged-in users to see comments → add verifyJWT
router.route("/:videoId").get(getVideoComments);
//Add comment (only logged-in users)
router.route("/:videoId").post(verifyJWT, addComment);
//Update comment (only comment owner)
router.route("/edit/:commentId").patch(verifyJWT, updateComment);
//Delete comment (comment owner OR video owner)
router.route("/delete/:commentId").delete(verifyJWT, deleteComment);

export default router;
