#!/usr/bin/env bash

chmod +x ./gradlew
./gradlew :telemoji-bot:test
export image_version=$(./gradlew :app:getVersion -q)
echo "lalalala"
echo ${image_version}
echo "version: ${image_version}"
echo "lalalala"
./gradlew dockerBuildImage
docker images
eval "docker tag sorcererxw/jikeview-bot:${image_version} sorcererxw/jikeview-bot:latest"
eval "docker push sorcererxw/jikeview-bot:${image_version}"
docker push sorcererxw/jikeview-bot:latest