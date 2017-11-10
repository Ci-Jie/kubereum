FROM ubuntu:16.04

MAINTAINER CiJie.Li(cjlee8110@gmail.com)

USER root

RUN apt-get update && \
	apt-get install -y git curl && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get install -y nodejs && \
	git clone https://github.com/cubedro/eth-netstats && \
	npm install && \
	cd eth-netstats && \
	npm install && \
	npm install -g grunt-cli && \
	grunt && \
	git clone http://git.nutc-imac.com/cjlee8110/kubereum.git && \
	cd kubereum/dashboard && \
	npm install

WORKDIR /eth-netstats/kubereum/dashboard

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]