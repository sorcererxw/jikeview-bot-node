package com.sorcererxw.jikeview.util

import java.util.*
import java.util.regex.Pattern

/**
 * @author: Sorcerer
 * @date: 2/4/2019
 * @description:
 */
object StringUtil {

    private val urlPattern = Pattern.compile(
            "(?:^|[\\W])((ht|f)tp(s?):\\/\\/|www\\.)"
                    + "(([\\w\\-]+\\.){1,}?([\\w\\-.~]+\\/?)*"
                    + "[\\p{Alnum}.,%_=?&#\\-+()\\[\\]\\*$~@!:/{};']*)",
            Pattern.CASE_INSENSITIVE or Pattern.MULTILINE or Pattern.DOTALL)

    fun extractUrls(text: String): List<String> {
        val matcher = urlPattern.matcher(text)
        val result: MutableList<String> = LinkedList()
        while (matcher.find()) {
            val matchStart = matcher.start(1)
            val matchEnd = matcher.end()
            result.add(text.substring(matchStart, matchEnd))
        }
        return result
    }
}