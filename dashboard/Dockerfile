FROM ubuntu:16.04

MAINTAINER CiJie.Li(cjlee8110@gmail.com)

USER root

COPY run.js .
COPY package.json .
COPY .babelrc .

RUN apt-get update && \
	apt-get install -y git curl && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install -y nodejs && \
	git clone https://github.com/cubedro/eth-netstats && \
	npm install

WORKDIR eth-netstats

RUN	npm install && \
	npm install -g grunt-cli && \
	npm install shelljs os fs && \
	grunt

WORKDIR /

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]