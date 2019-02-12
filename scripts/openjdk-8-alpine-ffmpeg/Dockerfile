FROM ubuntu

RUN apt update
RUN apt install -y software-properties-common
RUN add-apt-repository -y  ppa:jonathonf/ffmpeg-4
RUN apt update

RUN apt install -y ffmpeg openjdk-8-jre