package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName

/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
data class Post(
        @SerializedName("data") val postData: PostData
)