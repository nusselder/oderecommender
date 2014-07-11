var express = require('express');
var router = express.Router();

// Training the system supports POST for adding (new) data.
// PUT (update typically) and DELETE are not supported.

// Link to the database is set in app.js. Requests will *always*
// involve the database, so yay for simplicity.

router.post('/', function(req, res) {

  var error = function(msg) { res.send({"status": "error","msg": msg}); }
  var item = req.body.item;

  // Try to create a date from the timestamp.
  var timestamp = undefined;
  try {
    var date_timestamp = new Date(item.timestamp);
    timestamp = date_timestamp.toISOString().split('T')[0];
    //console.log(timestamp);
  } catch(e) {}

  // req.body is parsed as JSON if the appropriate header is sent.
  // Create new item from the post to make sure it does not contain junk.
  if (!item) error("No item found.");
  else if (!item.user_id) error("No item.user_id found.");
  else if (!item.place_id) error("No item.place_id found.");
  else if (!item.timestamp) error("No item.timestamp found.");
  else if (timestamp === undefined) error("Unparseable item.timestamp supplied.");

  // Everything fine!
  else {

    // New, clean item.
    item = {"user_id":item.user_id,"place_id":item.place_id,"timestamp":timestamp};

    // So, this is a My First Redis experience, note that:
    // Sorted Sets is not necessary for this demo app.
    // Similarly, pipelines (sounds like a good idea) are skipped.

    // Also, note that visits are considered symmetrical (and are duplicated),
    // e.g. there is no 'only here after there' notion in visits.
    // Places are paired regardless of the time between visits, i.e.
    // the "history" of a user only contains place_ids.
    // Self-references are possible if a user visits the same place
    // twice. There is no applicable reason not to allow this.


    // Update counts for the previously visited place_id's of the user.
    req.redis_client.lrange('u:'+item.user_id, 0, 9, function(err, prev_places){

      // ? log user list before update..
      //console.log('-'+item.user_id+'-: '+prev_places);

      prev_places.forEach(function(prev_place_id){

        // Possibly big! hash tables, this is what redis is for right?
        var timestamp_place = item.timestamp+':'+item.place_id;
        var timestamp_place_pair = timestamp_place+':'+prev_place_id;
        var reversed_timestamp_place = item.timestamp+':'+prev_place_id;
        var reversed_timestamp_place_pair = reversed_timestamp_place+':'+item.place_id;

        //console.log(timestamp_place_pair);

        // Keep count of the co-occurence of places for each day.
        req.redis_client.hincrby('timestamp:placepairs', timestamp_place_pair, 1);
        req.redis_client.hincrby('timestamp:placepairs', reversed_timestamp_place_pair, 1);

        // Keep a list of all co-occurences related to a specific date and place.
        // (i.e. hash key management?)
        req.redis_client.sadd(timestamp_place, timestamp_place_pair);
        req.redis_client.sadd(reversed_timestamp_place, reversed_timestamp_place_pair);
        
      });
    });

    // Update user with this newly visited place.
    req.redis_client.lpush('u:'+item.user_id, item.place_id);

    // ? log user list after update..
    //req.redis_client.lrange('u:'+item.user_id, 0, 9, function(err, uu){console.log('-'+item.user_id+'-: '+uu);});

    // Return the item as it was processed.
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
