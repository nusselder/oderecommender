#!/bin/bash
# Test rest interface with curl. Echo output for copy-paste to README.md

# Set port same as during install.
PORT=8005

function curl_post_train {
  echo -e "$1:\n"
  echo "    DATA='"$2"'"
  echo -ne "    # Response:\n    "
  curl -X POST -d $2 --header "Content-Type: application/json" http://localhost:$PORT/train
  echo -e "\n\n"
}

function curl_get_recommend {
  echo -e "$1:\n"
  echo "    curl -X GET http://localhost:$PORT$2"
  echo -ne "    # Response:\n    "
  curl -X GET http://localhost:$PORT/recommend$2
  echo -e "\n\n"
}



echo -e "## Example query+output\n"
echo -e "**draft**: update curl examples if I/O changes with actual recommendations.\n"
echo 'This output is generated by `./test_response.sh`'
echo -e "\n    Examples of responses for POST to /train/, ran as:"
echo '    curl -X POST -d $DATA --header "Content-Type: application/json" http://localhost:$PORT/train'
echo -e "\n"


echo -e "### Correct Training\n"

DATA='{"item":{"user_id":"uid","place_id":"pid","timestamp":"2014-07-03T00:00:00Z"}}'
curl_post_train "Item as JSON" $DATA

DATA='{"extra":"extra","item":{"user_id":"uid","place_id":"pid","timestamp":"2014-07-03T00:00:00Z","extra":"extra"}}'
curl_post_train "Item with extra content" $DATA


echo -e "### Incorrect Training\n"

# Special case without application/json
echo 'Item without  `--header "Content-Type: application/json"`:'
echo -e "\n    DATA='"$DATA"'"
echo -n "    Response: "
curl -X POST -d $DATA http://localhost:$PORT/train
echo -e "\n\n"

DATA='{"item_err":{"user_id":"uid","place_id":"pid","timestamp":"2014-07-03T00:00:00Z"}}'
curl_post_train "Missing item" $DATA

DATA='{"item":{"user_id_err":"uid","place_id":"pid","timestamp":"2014-07-03T00:00:00Z"}}'
curl_post_train "Missing user_id" $DATA

DATA='{"item":{"user_id":"uid","place_id_err":"pid","timestamp":"2014-07-03T00:00:00Z"}}'
curl_post_train "Missing place_id" $DATA

DATA='{"item":{"user_id":"uid","place_id":"pid","timestamp_err":"2014-07-03T00:00:00Z"}}'
curl_post_train "Missing timestamp" $DATA

DATA='{"item":{"user_id":"uid","place_id":"pid","timestamp":"2014-13-34T25:00:00Z"}}'
curl_post_train "Incorrect timestamp" $DATA


echo -e "### Recommendations\n"

curl_get_recommend "Missing place\_id" "/"

# Adding some additional data to test recommendation.
echo -e "(Adding some more data to test dummy recommendation.)\n"
(
curl -s -X POST -d '{"item":{"user_id":"uid1","place_id":"venue1","timestamp":"2014-07-03T09:00:00Z"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -s -X POST -d '{"item":{"user_id":"uid1","place_id":"venue2","timestamp":"2014-07-03T12:00:00Z"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -s -X POST -d '{"item":{"user_id":"uid1","place_id":"venue3","timestamp":"2014-07-03T15:00:00Z"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -s -X POST -d '{"item":{"user_id":"uid2","place_id":"venue2","timestamp":"2014-07-03T09:00:00Z"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -s -X POST -d '{"item":{"user_id":"uid2","place_id":"venue3","timestamp":"2014-07-03T12:00:00Z"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
curl -s -X POST -d '{"item":{"user_id":"uid2","place_id":"venue4","timestamp":"2014-07-03T15:00:00Z"}}' --header "Content-Type: application/json" http://localhost:$PORT/train
) > /dev/null

curl_get_recommend "Recommendation for venue2" "/venue2"

