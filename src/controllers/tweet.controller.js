import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    user: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "Error while creating tweet");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet posted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "userId is missing");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(`${userId}`) },
    },
  ]);

  if (!tweets) {
    throw new ApiError(400, "Error while fetching tweets");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }
  if (!content) {
    throw new ApiError(400, "content is missing");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
        content
    },
    {
      new: true,
    })

    res.status(200).json(new ApiResponse(200,tweet,"tweet updated successfully"))

});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is missing");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

  res.status(200).json(new ApiResponse(200,deleteTweet,"tweet deleted successfully"))


});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
