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
	git clone https://github.com/Ci-Jie/kubereum.git && \
	cd kubereum/netstat && \
	npm install

WORKDIR /eth-netstats/kubereum/netstat

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]