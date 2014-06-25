#!/bin/bash
# Log of steps taken to setup server.

start_path=`pwd`

# Download node binary.
mkdir programs
cd programs
wget "http://nodejs.org/dist/v0.10.29/node-v0.10.29-linux-x64.tar.gz"
tar -xf node-v0.10.29-linux-x64.tar.gz

# Download and install redis
wget "http://download.redis.io/releases/redis-2.8.12.tar.gz"
tar -xf redis-2.8.12.tar.gz
cd redis-2.8.12
make

# Start redis server, in start_path (dump.rdb will be there).
cd $start_path
./programs/redis-2.8.12/src/redis-server 2>&1 >> redis.log &

# Add node/bin to path, and set port environment (read during `npm start`)
echo "export PATH=$PATH:$start_path/programs/node-v0.10.29-linux-x64/bin/" > load_node_path.sh
echo "export PORT=8004" >> load_node_path.sh
. load_node_path.sh

# Get code from git.
# git clone something.. # later, now just copy..
#cp -r /scratch/users/anussel1/test-ode-recommender/oderecommender_clean/ oderecommender
#cd oderecommender

# Install dependencies.
npm install -g forever
npm install

# Start node.js server as daemon
#npm start
forever start bin/www

