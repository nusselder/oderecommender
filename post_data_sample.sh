#!/bin/bash
# Add dummy data to the database.

# Set port same as during install.
PORT=8004

# Assumes data_sample.csv as mentioned in README.md
DATA_FILE="data_sample.csv"

# The initial assumption was that dat was added incrementally.
# This is not optimal for a fixed data set, but fast enough.
while IFS=';' read user_id place_id timestamp; do
  curl -X POST -d '{"item":{"user_id":"'"$user_id"'","place_id":"'"$place_id"'","timestamp":"'"$timestamp"'"}}' --header 'Content-Type: application/json' http://localhost:$PORT/train
done < "$DATA_FILE"

