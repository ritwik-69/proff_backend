import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {  Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const user = await User.findById(req.user._id)
    const channel = await User.findById(channelId)
    if (!user ||!channel) {
        throw new ApiError(404, "User or channel not found")
    }
    const subscription = await Subscription.findOne({
        subscriber: user._id,
        channel: channel._id
    })
    if (!subscription) {
        await Subscription.create({
            subscriber: user._id,
            channel: channel._id
        })
    } else {
        await Subscription.deleteOne({
            subscriber: user._id,
            channel: channel._id
        })
    }

    const subscriptionDoc = await Subscription.findOne({
        subscriber: user._id,
        channel: channel._id
    })
    let isSubscribed
    if (subscriptionDoc) {
        isSubscribed = true
    } else {
        isSubscribed = false
    }

    res.status(200).json(new ApiResponse(200,{isSubscribed},"toggled subscribe"))


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "channelId is missing")
    }
    const channels = await Subscription.aggregate([
        {
            $match: {
                channel: channelId
            }
        }
    ])

    res.status(200).json(new ApiResponse(200, channels, "subscribers"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "subscriberId is missing")
    }
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: subscriberId
            }
        }
    ])
    res.status(200).json(new ApiResponse(200, channels, "channels"))

    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}