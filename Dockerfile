FROM node:8

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN npm install

# Bundle app source.
COPY midbot.js /src

CMD ["npm", "start"]
