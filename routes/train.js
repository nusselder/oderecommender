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

    // Create dummy data for dummy recommendation.
    req.redis_client.hincrby("place_counts", item.place_id, 1, req.redis_print);
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
