# Jikeview Bot

A Telegram bot that can fetch Jike post for you.

## HOW TO RUN

1. Create your bot with @BotFather
2. Define env args
    - BOT_NAME: the bot id, example: jikeview_bot
    - BOT_TOKEN: the bot token that @BotFather told you
    - FFMPEG: the path of ffmpeg on your device
    - FFPROBE: the path of ffprobe on your device
3. Done

## Docker

```bash
docker -d  -e "BOT_TOKEN=<BOT_TOKEN>" -e "BOT_NAME=<BOT_NAME>" run sorcererxw/jikeview-bot:1.0.0
```