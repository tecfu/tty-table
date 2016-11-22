FROM centos:7

RUN yum install -y epel-release

# Install nodejs 
RUN yum install -y nodejs npm
# RUN ln -s /usr/bin/nodejs /usr/bin/node
# Install bzip2 
RUN yum install -y bzip2

RUN yum install -y git

# Install tty-table
RUN git clone https://www.github.com/tecfu/tty-table

# Install grunt
RUN npm install grunt-cli -g

# Install dev dependencies
WORKDIR /tty-table
RUN npm install

# Run unit tests
RUN grunt t
