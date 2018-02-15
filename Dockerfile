FROM orihoch/sk8s-ops:node8

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN npm install

# Bundle app source.
COPY midbot.js /src

CMD ["-c", "npm start"]

ENV OPS_REPO_SLUG=Midburn/midburn-k8s
ENV OPS_REPO_BRANCH=master
