FROM ubuntu:16.04

MAINTAINER CiJie.Li(cjlee8110@gmail.com)

USER root

RUN apt-get update && \
	apt-get install -y git curl && \
	git clone https://github.com/cubedro/eth-net-intelligence-api && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install nodejs && \
	npm install && \
	git clone http://git.nutc-imac.com/cjlee8110/kubereum.git && \
	cd kubereum/monitor && \
	npm install

WORKDIR /kubereum/monitor

ENTRYPOINT ["node", "run", "start"]
