package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName

data class Video(
        @SerializedName("duration")
        val duration: Int?, // 140000
        @SerializedName("source")
        val source: List<Any?>?,
        @SerializedName("thumbnailUrl")
        val thumbnailUrl: String?, // https://pic-txcdn.ruguoapp.com/Fr71UsUFLBR8f_DQXYaeS2G5Se3d?imageMogr2/auto-orient/heic-exif/1/format/jpeg?imageView2/0/w/800/h/800
        @SerializedName("type")
        val type: String? // VIDEO
)