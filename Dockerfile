FROM node:9.11.1

RUN echo "$TZ" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

WORKDIR /app

ADD ./package.json /app/package.json
ADD ./index.js /app/index.js

RUN npm install -q --production

CMD ["true"]
