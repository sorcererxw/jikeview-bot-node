package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName

data class Picture(
        @SerializedName("cropperPosX") val cropperPosX: Double?, // 0.5
        @SerializedName("cropperPosY") val cropperPosY: Double?, // 0.5
        @SerializedName("format") val format: String?, // jpeg
        @SerializedName("height") val height: Int?, // 461
        @SerializedName("middlePicUrl") val middlePicUrl: String?, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/1000x2000%3E/quality/70/interlace/1
        @SerializedName("picUrl") val picUrl: String?, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/202840@
        @SerializedName("smallPicUrl") val smallPicUrl: String?, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/400x2000%3E/quality/70/interlace/1
        @SerializedName("thumbnailUrl") val thumbnailUrl: String?, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/300x2000%3E/quality/70/interlace/1
        @SerializedName("watermarkPicUrl") val watermarkPicUrl: String?, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/202840@%7Cwatermark/3/image/aHR0cHM6Ly93YXRlcm1hcmsuamlrZS5ydWd1b2FwcC5jb20vP3RleHQ9JUU1JThEJUIzJUU1JTg4JUJCJTIwJTQwJUU2JTk2JTk3JUU1JTlCJUJFJUU4JThGJThDJmhlaWdodD0yMg==/gravity/SouthEast/dx/10/dy/10
        @SerializedName("width") val width: Int? // 440
)