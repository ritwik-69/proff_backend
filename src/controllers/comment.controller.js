import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { page = 1, limit = 10 } = req.query;

  const {videoId} = req.params;

  if (!videoId) {
      throw new ApiError(400,"video id is missing")
  }

  const comments = await Comment.aggregate([
      {
          $match:{video: new mongoose.Types.ObjectId(`${videoId}`)}
      },
      {
          $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                  {
                      $project:{
                          username:1,
                          fullName:1,
                          avatar:1
                      }
                  }
              ]
          }
      }
  ])

  if(!comments){
      throw new ApiError(404,"comments not found")
  }

  return res.status(200).json(new ApiResponse(200,comments,"comments fetched successfully"))
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { channelId, videoId } = req.params;
  const { content } = req.body;

  if (!channelId || !videoId) {
    throw new ApiError(400, "channelId or videoId is missing");
  }

  if (!content) {
    throw new ApiError(400, "Comments not found");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    user: channelId,
  });
  if (!comment) {
    throw new ApiError(404, "error while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }
  if (!content) {
    throw new ApiError(400, "content is missing");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "commentId is missing");
  }
  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
