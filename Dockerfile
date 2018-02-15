FROM orihoch/sk8s-ops:node8

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN npm install

# Bundle app source.
COPY midbot.js /src

CMD ["-c", "npm start"]
