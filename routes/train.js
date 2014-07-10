var express = require('express');
var router = express.Router();

// Training the system supports POST for adding (new) data.
// PUT (update typically) and DELETE are not supported.
// todo: maybe support get for testing?

// Link to the database is set in app.js. Requests will *always*
// involve the database, so yay for simplicity.

router.post('/', function(req, res) {

  var error = function(msg) { res.send({"status": "error","msg": msg}); }
  var item = req.body.item;

  // req.body is parsed as JSON if the appropriate header is sent.
  // Create new item from the post to make sure it does not contain junk.
  if (!item) error("No item found.");
  else if (!item.user_id) error("No item.user_id found.");
  else if (!item.place_id) error("No item.place_id found.");
  else if (!item.timestamp) error("No item.timestamp found.");
  else if (false) error("TODO: check timestamp.");

  // Everything fine!
  else {
    // New, clean item.
    item = {"user_id":item.user_id,"place_id":item.place_id,"timestamp":item.timestamp};

    // So, this is a My First Redis experience, note that:
    // Sorted Sets is not necessary for this demo app.
    // Similarly, pipelines (sounds like a good idea) are skipped.

    // Also, note that visits are considered symmetrical (and is duplicated),
    // e.g. there is no 'only here after there' notion in visits.
    // Places are paired regardless of the time between visits, i.e.
    // the "history" of a user only contains place_ids.


    // item.timestamp == date only

    // Update counts for the previously visited place_id's of the user.
    req.redis_client.lrange('u:'+item.user_id, 0, 9, function(err, prev_places){

      console.log('-'+item.user_id+'-: '+prev_places);
      prev_places.forEach(function(prev_place_id){

        // Old stuff
        // Update the co-occurence of the two places, for the current day.
        //var pair_1 = item.place_id+':'+place_id;
        //var pair_2 = place_id+':'+item.place_id;

        //req.redis_client.hincrby(item.timestamp, pair_1, 1, req.redis_print);
        //req.redis_client.hincrby(item.timestamp, pair_2, 1, req.redis_print);

        // Update a dictionary of all timestamp:place1:place2 triples, so we can get them in one go.
        //req.redis_client.hincrby(item.timestamp, pair_1, 1, req.redis_print);

        // Keep track of all pairs, for a given date and place.
        //req.redis_client.sadd(item.timestamp+':'+item.place_id, pair_1, req.redis_print);
        //req.redis_client.sadd(item.timestamp+':'+place_id, pair_2, req.redis_print);



        // Biiig! hash tables, this is what redis is for right?

        var timestamp_place = item.timestamp+':'+item.place_id;
        var timestamp_place_pair = timestamp_place+':'+prev_place_id;
        var reversed_timestamp_place = item.timestamp+':'+prev_place_id;
        var reversed_timestamp_place_pair = reversed_timestamp_place+':'+item.place_id;

        // Keep count of the co-occurence of places for each day.
        req.redis_client.hincrby('timestamp:placepairs', timestamp_place_pair, 1);
        req.redis_client.hincrby('timestamp:placepairs', reversed_timestamp_place_pair, 1);

        // Keep a list of all co-occurences related to a specific date and place.
        // (i.e. hash key management?)
        req.redis_client.sadd(timestamp_place, timestamp_place_pair);
        req.redis_client.sadd(reversed_timestamp_place, reversed_timestamp_place_pair);

        // Also update an 'all' in case of too little data?
        //req.redis_client.hincrby('t:all', pair_1, 1, req.redis_print);
        //req.redis_client.hincrby('t:all', pair_2, 1, req.redis_print);

        // Some debug logging..
        //console.log(pair_1);
        //console.log(pair_2);
        //console.log(item.timestamp+':'+item.place_id);
        console.log(timestamp_place_pair);
        console.log(reversed_timestamp_place_pair);
        
      });
    });

    // Update user with this newly visited place.
    req.redis_client.lpush('u:'+item.user_id, item.place_id, req.redis_print);

    req.redis_client.lrange('u:'+item.user_id, 0, 9, function(err, uu){console.log('-'+item.user_id+'-: '+uu);});
      




    // Old dummy train code.

    // Create dummy data for dummy recommendation.
    //req.redis_client.hincrby("place_counts", item.place_id, 1, req.redis_print);
    //req.redis_client.zincrby("place_sort", 1, item.place_id, req.redis_print);





    // Other tries tests:
    // Let's create some dummy data and recommendations: keep track of the place, and recommend itself with
    // as score the number of times it was visited :-P
    //req.redisclient.zincrby(["place_visits",1,item.place_id],req.redis.print);
    //req.redisclient.zincrby(["place_visits",1,item.place_id],function(){});

    //console.log("POSTing:" + item.toString());

    //req.redisclient.hset("items",item.user_id, item.place_id,function(resp){console.log(resp);});
    //req.redisclient.hset("items",item.item.user_id, item.item.place_id,req.redis.print);
    //req.redisclient.hset("items",item.user_id, item.place_id,function(){});

    //req.redisclient.hkeys("items", function (err, replies) {
    //    console.log(replies.length + " replies:");
    //    replies.forEach(function (reply, i) {
    //        console.log("    " + i + ": " + reply);
    //    });
    //});
    //req.redisclient.zrange("place_visits", 0, 3, 'withscores', function(err, results){
    //  for( var i = 0, len = results.length; i < len; i++ ){
    //    if(results[i]) console.log(results[i]);
    //    else console.log('error?');
    //  }
    //});

    res.json( {"status": "accept", "msg": "", "item": item} );
  }

});

router.get('/', function(req, res) {
  res.send( {'msg': 'maybe support GET?'} )
});

router.delete('/', function(req, res) {
  res.send( {'msg': 'DELETE not supported.'} )
});

router.put('/', function(req, res) {
  res.send( {'msg': 'PUT not supported, please use POST to add new training data.'} )
});

module.exports = router;
