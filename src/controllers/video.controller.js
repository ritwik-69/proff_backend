import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let sortCriteria = {}
    let videoQuery = {}

    if (userId) {
        videoQuery.userId = userId
    }

    if (query) {
        videoQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }

    if (sortBy && sortType) {
        sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
    }

    const videos = await Video.find(videoQuery)
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(limit);

    if (!videos) {
        throw new ApiError(400, "error while fetching all videos")
    }

    return res.status(200).json(new ApiResponse(200, videos, "videos fetched"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailocalPath = req.files.thumbnail[0].path;

    if (!title) {
        throw new ApiError(400,"title is missing")
    }

    if (!thumbnailocalPath) {
        throw new ApiError(400, "thumbnail not uploaded")
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "video is missing")
    }

    const publishedThumbnail = await uploadOnCloudinary(thumbnailocalPath);
    const publishedVideo = await uploadOnCloudinary(videoLocalPath);

    if (!publishedVideo) {
        throw new ApiError(500, "error while uploading video")
    }

    if (!publishedThumbnail) {
        throw new ApiError(500,"error while uploading thumbnail ")
    }

    // console.log(publishedVideo);

    const video = await Video.create(
        {
            title,
            description: description || "",
            thumbnail: publishedThumbnail.url,
            videoFile: publishedVideo.url,
            duration: publishedVideo.duration
        }
    )

    video.owner = req.user?._id;
    video.save();

    console.log(video);

    return res.status(200).json(new ApiResponse(200, video, "video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId){
        throw new ApiError(400, "videoId is missing")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found")
    }
    return res.status(200).json(new ApiResponse(200, video, "video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description, thumbnail } = req.body;

    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }

    const video = await Video.findById(videoId);
    const thumbnailocalPath = req.files.thumbnail[0].path;
    const publishedThumbnail = await uploadOnCloudinary(thumbnailocalPath)

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    if (title) {
        video.title = title;
    }

    if (description) {
        video.description = description;
    }

    if (thumbnail) {
        video.thumbnail = publishedThumbnail.url;
    }

    video.save();

    return res.status(200).json(new ApiResponse(200, video, "video updated successfully"));



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }
    return res.status(200).json(new ApiResponse(200, video, "video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }
    const video = await Video.findById(videoId);

    if (!video){
        throw new ApiError(404, "video not found");
    }
    if (video.isPublished === true){
        const vid = Video.findByIdAndUpdate(videoId,{
            isPublished: false
        },{
            new: true
        })
    }
    else{
        const vid = Video.findByIdAndUpdate(videoId,{
            isPublished: true
        },{
            new: true
        })
    }

    return res.status(200).json(new ApiResponse(200, video, "toggled publish"));

    

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
