#!/bin/bash
# Log of steps taken to setup server.
# Assumes no other running instances of node.js/redis.

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
# Default port is 6379.
cd $start_path
mkdir -p logs
./programs/redis-2.8.12/src/redis-server 2>&1 >> logs/redis.log &

# Add node/bin to path, and set port environment (read during `npm start`/`forever start bin/www`).
echo "export PATH=$PATH:$start_path/programs/node-v0.10.29-linux-x64/bin/" > load_node_path.sh
echo "export PORT=8005" >> load_node_path.sh
. load_node_path.sh

# Install dependencies.
npm install -g forever
npm install

# Start node.js server as daemon
#npm start
forever start bin/www

echo '*** Done ***'
echo 'To stop node.js `source load_node_path.sh` and then `forever stop all`.'
echo 'To stop redis server `ps aux | grep redis` and kill the server process.'
echo 'A database dump of the redis server is saved periodicallly to:'
echo "$start_path/dump.rdb"

