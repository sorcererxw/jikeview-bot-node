#!/usr/bin/env bash

chmod +x ./gradlew
export image_version=$(./gradlew :app:getVersion -q)
echo ${image_version}
./gradlew dockerBuildImage
docker images
docker tag sorcererxw/jikeview-bot:${image_version} sorcererxw/jikeview-bot:latest
docker push sorcererxw/jikeview-bot:${image_version}
docker push sorcererxw/jikeview-bot:latest