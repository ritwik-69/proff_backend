import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const isLiked = await Like.findById({
    video: videoId,
    likedby: req.user._id,
  });

  if (!isLiked) {
    const like = await Like.create({
      videoId: videoId,
      likedby: req.user._id,
    });

    if (!like) {
      throw new ApiError(400, "error while liking");
    }
  } else {
    await Like.findByIdAndDelete(isLiked._id);
  }

  const videoLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let isVideoLiked;

  if (!videoLiked) {
    isVideoLiked = false;
  } else {
    isVideoLiked = true;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isVideoLiked }, " video liked"));

  
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  const isLiked = await Like.findById({
    comment: commentId,
    likedby: req.user._id,
  })

  if (!isLiked) {
    const like = await Liked.create({
      commentId: commentId,
      likedby: req.user._id,
    });

    if (!like) {
      throw new ApiError(400, "error while liking");
    }
  } else {
    await Like.findByIdAndDelete(isLiked._id);
  }

  const commentLiked = await Liked.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  let isCommentLiked;
  if (!commentLiked) {
    isCommentLiked = false;
  } else {
    isCommentLiked = true;
  }

  res.status(200).json(new ApiResponse(200,{isCommentLiked},"comment Liked"))
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  const isLiked = await Like.findById({
    tweet: tweetId,
    likedby: req.user._id,
  });

  if (!isLiked) {
    const like = await Like.create({
      tweetId: tweetId,
      likedby: req.user._id,
    });

    if (!like) {
      throw new ApiError(400, "error while liking");
    }
  } else {
    await Like.findByIdAndDelete(isLiked._id);
  }

  const tweetLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  let isTweetLiked;

  if (!tweetLiked) {
    isTweetLiked = false;
  } else {
    isTweetLiked = true;
  }

  res.status(200).json(new ApiResponse(200,{isTweetLiked},"tweet is liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.find(
    {
        likedBy: req.user._id,
        video:{$ne: null}
    }
).populate("video")

if (!likedVideos) {
    throw new ApiError(400,"error while fetching liked videos")
}

return res.status(200).json(new ApiResponse(200,likedVideos,"liked video fetched"))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
