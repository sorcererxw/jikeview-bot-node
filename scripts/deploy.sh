#!/bin/bash

bot_name=$1
bot_token=$2

image_name="sorcererxw/jikeview-bot:latest"
container_name="jikeview-bot"

if [[  "$(docker ps -q -f name=${container_name})" ]]; then
    eval "docker update --restart=no ${container_name}"
    eval "docker stop ${container_name}"
    eval "docker rm ${container_name}"
fi

eval "docker pull ${image_name}"
eval "docker run -d --restart always -e BOT_NAME=${bot_name} -e BOT_TOKEN=${bot_token} --name ${container_name} ${image_name}"
