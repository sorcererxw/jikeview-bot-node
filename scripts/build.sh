#!/usr/bin/env bash

chmod +x ./gradlew
./gradlew :app:test
./gradlew :app:dockerBuildImage
echo $(./gradlew :app:getVersion -q)
export image_version=$(./gradlew :app:getVersion -q) # mush run a gradlew command before this line
echo $image_version
eval "docker tag sorcererxw/jikeview-bot:${image_version} sorcererxw/jikeview-bot:latest"
docker images
eval "docker push sorcererxw/jikeview-bot:${image_version}"
docker push sorcererxw/jikeview-bot:latest