import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

/* -----------------------------
   PROTECTED ROUTES ONLY
--------------------------------*/
router.use(verifyJWT);

// Create playlist
router.route("/")
    .post(createPlaylist);

// Get all playlists of a user
router.route("/user/:userId")
    .get(getUserPlaylists);

// Get a single playlist by ID
router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

// Add a video to playlist
router.route("/:playlistId/video/:videoId")
    .post(addVideoToPlaylist);

// Remove video from playlist
router.route("/:playlistId/video/:videoId")
    .delete(removeVideoFromPlaylist);

export default router;
