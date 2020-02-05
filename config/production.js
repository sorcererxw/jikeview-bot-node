module.exports = {
  botToken: process.env.BOT_TOKEN,
  storageChat: process.env.STORAGE_CHAT,
  domain: process.env.DOMAIN,
  port: parseInt(process.env.PORT || '3000', 10),
}
