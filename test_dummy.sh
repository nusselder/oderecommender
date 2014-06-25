#!/bin/bash
# Test rest interface with curl.

# Set port same as during install.
PORT=8004

# Items
CORRECT='{"item":{"user_id":"uid","place_id":"pid","timestamp":"2014-03-03T00:00:00"}}'
CORRECT_WITH_EXTRA='{"extra":"extra","item":{"user_id":"uid","place_id":"pid","timestamp":"2014-03-03T00:00:00","extra":"extra"}}'
MISSING_ITEM='{"item_err":{"user_id":"uid","place_id":"pid","timestamp":"2014-03-03T00:00:00"}}'
MISSING_USER_ID='{"item":{"user_id_err":"uid","place_id":"pid","timestamp":"2014-03-03T00:00:00"}}'
MISSING_PLACE_ID='{"item":{"user_id":"uid","place_id_err":"pid","timestamp":"2014-03-03T00:00:00"}}'
MISSING_TIMESTAMP='{"item":{"user_id":"uid","place_id":"pid","timestamp_err":"2014-03-03T00:00:00"}}'
INCORRECT_TIMESTAMP='todo'

echo '---------------------------------------------------------'
echo 'Examples of responses for POST to /train/, ran as:'
echo 'curl -X POST -d $DATA --header "Content-Type: application/json" http://localhost:$PORT/train'
echo -e "\n---------------------------------------------------------"
echo "Correct item as JSON:"
echo "DATA='"$CORRECT"'"
echo "Response:"
curl -X POST -d $CORRECT --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Correct item without application/json header:"
echo "DATA='"$CORRECT"'"
echo "Response:"
curl -X POST -d $CORRECT http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Correct item with extra content:"
echo "DATA='"$CORRECT_WITH_EXTRA"'"
echo "Response:"
curl -X POST -d $CORRECT_WITH_EXTRA --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Missing item:"
echo "DATA='"$MISSING_ITEM"'"
echo "Response:"
curl -X POST -d $MISSING_ITEM --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Missing user_id:"
echo "DATA='"$MISSING_USER_ID"'"
echo "Response:"
curl -X POST -d $MISSING_USER_ID --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Missing place_id:"
echo "DATA='"$MISSING_PLACE_ID"'"
echo "Response:"
curl -X POST -d $MISSING_PLACE_ID --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Missing timestamp:"
echo "DATA='"$MISSING_TIMESTAMP"'"
echo "Response:"
curl -X POST -d $MISSING_TIMESTAMP --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Incorrect timestamp"
echo 'todo'
echo
echo -e "\n\n---------------------------------------------------------"
echo "Adding some more data to test dummy recommendation."
curl -X POST -d '{"item":{"user_id":"uid","place_id":"venue1","timestamp":"2014-03-03T00:00:00"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -X POST -d '{"item":{"user_id":"uid","place_id":"venue1","timestamp":"2014-03-03T00:00:00"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -X POST -d '{"item":{"user_id":"uid","place_id":"venue1","timestamp":"2014-03-03T00:00:00"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -X POST -d '{"item":{"user_id":"uid","place_id":"venue2","timestamp":"2014-03-03T00:00:00"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -X POST -d '{"item":{"user_id":"uid","place_id":"venue3","timestamp":"2014-03-03T00:00:00"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -X POST -d '{"item":{"user_id":"uid","place_id":"venue3","timestamp":"2014-03-03T00:00:00"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
echo -e "\n\n---------------------------------------------------------"
echo "Test getting recommendations."
echo
echo "curl -X GET http://localhost:$PORT/recommend"
curl -X GET http://localhost:$PORT/recommend
echo
echo
echo "curl -X GET http://localhost:$PORT/recommend/somevenue"
curl -X GET http://localhost:$PORT/recommend/somevenue

