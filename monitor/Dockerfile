FROM ubuntu:16.04

MAINTAINER CiJie.Li(cjlee8110@gmail.com)

USER root

COPY run.js .
COPY package.json .
COPY .babelrc .

RUN apt-get update && \
	apt-get install -y git curl && \
	git clone https://github.com/cubedro/eth-net-intelligence-api && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install nodejs && \
	npm install

WORKDIR /

ENTRYPOINT ["node", "run", "start"]
