package com.sorcererxw.jikeview.jike

import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.test.context.junit4.SpringRunner

/**
 * @author: Sorcerer
 * @date: 2/11/2019
 * @description:
 */

class JikeUrlParserTests {
    @Test
    fun testParser() {
        val url = "https://m.okjike.com/originalPosts/5c600f221974140016e04931?source_username=86cdd8bd-b8fc-472d-9240-f28358749211"
        println(JikeUrlParser.parser(url))
    }
}