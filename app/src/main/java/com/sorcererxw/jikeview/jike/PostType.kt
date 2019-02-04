package com.sorcererxw.jikeview.jike

/**
 * @author: Sorcerer
 * @date: 2/3/2019
 * @description:
 */
enum class PostType {
    OFFICIAL_MESSAGE {
        override fun apiPathName(): String = "officialMessages"
        override fun typeName(): String = "OFFICIAL_MESSAGE"
    },
    ORIGINAL_POST {
        override fun apiPathName(): String = "originalPosts"
        override fun typeName(): String = "ORIGINAL_POST"
    };

    abstract fun apiPathName(): String
    abstract fun typeName(): String

    companion object {
        fun from(name: String?): PostType {
            if (name == ORIGINAL_POST.typeName()) {
                return ORIGINAL_POST
            }
            return OFFICIAL_MESSAGE
        }
    }
}