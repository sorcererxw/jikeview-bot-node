package com.sorcererxw.jikeview.jike

import com.sorcererxw.jikeview.jike.entity.MediaMeta
import com.sorcererxw.jikeview.jike.entity.Post
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
interface JikeService {
    @GET("originalPosts/get")
    fun getOriginalPost(@Query("id") postId: String): Call<Post>

    @GET("officialMessages/get")
    fun getOfficialMessage(@Query("id") postId: String): Call<Post>

    @GET("mediaMeta/play")
    fun getMediaMeta(@Query("id") id: String, @Query("type") type: String): Call<MediaMeta>
}