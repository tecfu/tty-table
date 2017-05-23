FROM ubuntu:12.04.5

# Because there is no package cache in the image, you need to run:
RUN apt-get update

# Install nodejs
RUN apt-get install curl -y
RUN apt-get install python-software-properties -y
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs

# Install tty-table
RUN apt-get install git -y
RUN git clone https://www.github.com/tecfu/tty-table

# Install grunt
RUN npm install grunt-cli -g

WORKDIR /tty-table

# Manual Phantomjs install
RUN apt-get install wget -y
RUN apt-get install bzip2 -y
RUN apt-get install libfontconfig1 -y
RUN cd /usr/local/share/
RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.6-linux-x86_64.tar.bz2
RUN ls
RUN tar xjf phantomjs-1.9.6-linux-x86_64.tar.bz2
RUN rm -f phantomjs-1.9.6-linux-x86_64.tar.bz2
RUN ln -s phantomjs-1.9.6-linux-x86_64 phantomjs
RUN ln -s /usr/local/share/phantomjs/bin/phantomjs /usr/bin/phantomjs

#RUN npm uninstall -D grunt-mocha
#RUN npm i grunt-mocha@0.4.13 
RUN npm install 

# Run unit tests
RUN node -v
RUN grunt t
