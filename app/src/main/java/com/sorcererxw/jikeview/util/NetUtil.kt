package com.sorcererxw.jikeview.util

import java.net.Socket

/**
 * @author: sorcererxw
 * @date: 2019/4/28
 * @description:
 */
object NetUtil {
    private fun isAddressAvailable(address: String, port: Int): Boolean {
        return try {
            Socket(address, port)
            true
        } catch (e: Exception) {
            false
        }
    }
}