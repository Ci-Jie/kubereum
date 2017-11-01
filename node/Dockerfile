FROM ubuntu:16.04

MAINTAINER CiJie.Li(cjlee8110@gmail.com)

USER root

COPY genesis.json .
COPY run.js .
COPY package.json .
COPY .babelrc .

RUN apt-get update && \
	apt-get install -y software-properties-common && \
	add-apt-repository -y ppa:ethereum/ethereum && \
	apt-get update && \
	apt-get install -y ethereum git curl && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install nodejs && \
	npm install && \
	git clone https://github.com/cubedro/eth-net-intelligence-api && \
	cd eth-net-intelligence-api && \
	npm install && \
	npm install -g pm2

WORKDIR /

EXPOSE 2000 8545

ENTRYPOINT ["node", "run", "start"]
