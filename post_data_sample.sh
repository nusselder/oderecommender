#!/bin/bash
# Train with sample data.

# Set port same as during install.
PORT=8004

# TODO: make variable data_file argument, to add all sample data..
DATA_FILE="data_sample.csv"

while IFS=';' read user_id place_id timestamp; do
  curl -X POST -d '{"item":{"user_id":"'"$user_id"'","place_id":"'"$place_id"'","timestamp":"'"$timestamp"'"}}' --header 'Content-Type: application/json' http://localhost:$PORT/train
done < "$DATA_FILE"

