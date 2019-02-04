package com.sorcererxw.jikeview.jike

import java.util.regex.Pattern

/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
object JikeUrlParser {

    private val WEB_ORIGINAL_POST = Pattern.compile(
            "^(https?://)?web\\.okjike\\.com/post-detail/([0-9a-z]+)/originalPost(\\?.*)?$"
    )
    private val WEB_OFFICIAL_MESSAGE = Pattern.compile(
            "^(https?://)?web\\.okjike\\.com/message-detail/([0-9a-z]+)/officialMessage(\\?.*)?$"
    )
    private val MOBILE_ORIGINAL_POST = Pattern.compile(
            "^(https?://)?m\\.okjike\\.com/originalPosts/([0-9a-z]+)(\\?.*)?$"
    )
    private val MOBILE_OFFICIAL_MESSAGE = Pattern.compile(
            "^(https?://)?m\\.okjike\\.com/officialMessages/([0-9a-z]+)(\\?.*)?$"
    )

    @Throws(UnsupportedOperationException::class)
    fun parser(url: String): Pair<PostType, String> {
        if (url.matches(WEB_OFFICIAL_MESSAGE.toRegex())) {
            return Pair(
                    PostType.OFFICIAL_MESSAGE,
                    WEB_OFFICIAL_MESSAGE.matcher(url).also { it.find() }.group(2)
            )
        }
        if (url.matches(WEB_ORIGINAL_POST.toRegex())) {
            return Pair(
                    PostType.ORIGINAL_POST,
                    WEB_ORIGINAL_POST.matcher(url).also { it.find() }.group(2)
            )
        }
        if (url.matches(MOBILE_OFFICIAL_MESSAGE.toRegex())) {
            return Pair(
                    PostType.OFFICIAL_MESSAGE,
                    MOBILE_OFFICIAL_MESSAGE.matcher(url).also { it.find() }.group(2)
            )
        }
        if (url.matches(MOBILE_ORIGINAL_POST.toRegex())) {
            return Pair(
                    PostType.ORIGINAL_POST,
                    MOBILE_ORIGINAL_POST.matcher(url).also { it.find() }.group(2)
            )
        }
        throw UnsupportedOperationException("not support url: $url")
    }

    fun generateMessageUrl(type: PostType, id: String): String {
        return if (type == PostType.OFFICIAL_MESSAGE) {
            "https://web.okjike.com/message-detail/$id/officialMessage"
        } else {
            "https://web.okjike.com/post-detail/$id/originalPost"
        }
    }
}