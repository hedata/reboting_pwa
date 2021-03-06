# Use AlDorados yarn-node-postgres image
FROM aldorado/yarn-node:latest

# Prepare app directory & copy package.json from codebase
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json package-lock.json /usr/src/app/

# Install node packages
RUN npm install
RUN npm rebuild node-sass

# Copy codebase
COPY . /usr/src/app
