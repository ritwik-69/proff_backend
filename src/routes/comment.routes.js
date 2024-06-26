import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/create/:channelId/:videoId").post(verifyJWT,addComment);
router.route("/vid-comments/:videoId").get(verifyJWT,getVideoComments);
router.route("/delete-comment/:commentId").post(verifyJWT,deleteComment);
router.route("/update-comment/:commentId").post(verifyJWT,updateComment);

export default router;