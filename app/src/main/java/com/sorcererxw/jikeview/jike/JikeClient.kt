package com.sorcererxw.jikeview.jike

import com.google.gson.GsonBuilder
import com.sorcererxw.jikeview.jike.entity.MediaMeta
import com.sorcererxw.jikeview.jike.entity.Post
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.converter.scalars.ScalarsConverterFactory


/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */

class JikeClient private constructor() {
    companion object {
        private const val BASE_URL = "https://app.jike.ruguoapp.com/1.0/"

        val instance = JikeClient()
    }

    private val gson = GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .create()

    private val httpClient: OkHttpClient = OkHttpClient.Builder().build()

    private val service: JikeService = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(ScalarsConverterFactory.create())
            .addConverterFactory(GsonConverterFactory.create(gson))
            .client(httpClient)
            .build()
            .create(JikeService::class.java)

    fun getPostByUrl(url: String): Post? {
        try {
            val result = JikeUrlParser.parser(url)
            if (result.first == PostType.ORIGINAL_POST) {
                return service.getOriginalPost(result.second).execute().body()
            }
            if (result.first == PostType.OFFICIAL_MESSAGE) {
                return service.getOfficialMessage(result.second).execute().body()
            }
        } catch (e: Exception) {
        }
        return null
    }

    fun getMediaMeta(id: String, type: PostType): MediaMeta {
        return service.getMediaMeta(id, type.typeName()).execute().body()!!
    }
}