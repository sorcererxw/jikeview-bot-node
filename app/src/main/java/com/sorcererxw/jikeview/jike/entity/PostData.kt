package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName
import java.util.*

/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
data class PostData(
        @SerializedName("id") val id: String,
        @SerializedName("type") val type: String?,
        @SerializedName("content") val content: String,
        @SerializedName("urlsInText") var urlsInText: List<UrlContent>,
        @SerializedName("status") val status: String,
        @SerializedName("pictures") val pictures: List<Picture>?,
        @SerializedName("pictureUrls") val pictureUrls: List<Picture>?,
        @SerializedName("createdAt") val createdDate: Date,
        @SerializedName("messageId") val messageId: String,
        @SerializedName("topic") val topic: PostTopic?,
        @SerializedName("linkUrl") val linkUrl: String?,
        @SerializedName("video") val video: Video?,
        @SerializedName("linkInfo") val linkInfo: LinkInfo?
)