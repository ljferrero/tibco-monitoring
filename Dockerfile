FROM node:10.15.3-jessie

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app
RUN chmod -R 777 /usr/src/app

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Get all the code needed to run the app
COPY package.json /usr/src/app
COPY app-version.json /usr/src/app
COPY dist /usr/src/app/dist
COPY server /usr/src/app/server
COPY certs /usr/src/app/certs
COPY node_modules /usr/src/app/node_modules
COPY instantclient /usr/src/app/lib/instantclient

ENV CLIENT_FILENAME instantclient-basic-linux.x64-19.6.0.0.0dbru.zip
WORKDIR /opt/oracle/lib
RUN apt-get update
RUN apt-get install libaio1
RUN LIBS="*/*" && \
    unzip /usr/src/app/lib/instantclient/${CLIENT_FILENAME} ${LIBS} && \
    for lib in ${LIBS}; do mv ${lib} /usr/lib; done
#RUN ln -s /usr/lib/libclntsh.so.19.1 /usr/lib/libclntsh.so
RUN export LD_LIBRARY_PATH=/usr/lib:$LD_LIBRARY_PATH
WORKDIR /usr/src/app
RUN npm rebuild
# Expose the port the app runs in
EXPOSE 8080
EXPOSE 443

# Serve the app
CMD ["npm", "start"]