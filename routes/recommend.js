var express = require('express');
var router = express.Router();

// Recommendation just supports GET.

// Link to the database is set in app.js. Requests will *always*
// involve the database, so yay for simplicity.

router.delete('/', function(req, res) {
  res.send( {'status': 'error', 'msg': 'DELETE not supported.'} );
});
router.put('/', function(req, res) {
  res.send( {'status': 'error', 'msg': 'PUT not supported.'} );
});
router.post('/', function(req, res) {
  res.send( {'status': 'error', 'msg': 'POST not supported.'} );
});
router.get('/', function(req, res) {
  res.send( {'status': 'error', 'msg': 'Please specify a place_id.'} );
});


router.get('/old/:id', function(req, res) {

  var recommendations = [];

  // Dummy output, just a list of everything.
  req.redis_client.hgetall('place_counts', function(err, objs){
  //req.redis_client.zrange('place_sort', 0, 4, 'withscores', function(err, objs){
    for (var k in objs) {
      recommendations.push({'place_id': k, 'value': parseFloat(objs[k])});
      }
    // redis_get does not finish before return, so within this function..
    res.json( {'status': 'accept', 'msg': 'Dummy recommendation', 'places': recommendations} );
  });

});


router.get('/:id', function(req, res) {

  // The numbers of days to consider.
  var days_back = 3;

  // The current time/date
  var timestamp = '2014-03-03T07:34:12Z';

  // The place for which to get recommendations.
  var place_id = req.params.id;

  // ? keep track of rec.s here
  var recommendations = [];

  // ? log full request.
  console.log('Request: '+place_id+' : '+timestamp+' : -'+days_back);

  // Generate the list of dates.
  var dates = [];
  var today = new Date(timestamp);
  for(var i=0; i<days_back; i++){
    dates.push( today.toISOString().split('T')[0] );
    today.setDate(today.getDate() - 1);
  }

  // Generate list of keys to retrieve the actual counts from.
  // N.B. generating this list with not just the one given venue,
  // but for each of a set of venues (i.e. all places a *user*
  // visited) allows for personalised recommendation.
  var coocurrence_keys = [];
  var place_ids = [place_id]; // Example for future personalisation.
  // var place_ids = [place_id, 'faux venue id'];
  for(var i=0; i<dates.length; i++){
    for(var j=0; j<place_ids.length; j++) {
      coocurrence_keys.push( dates[i]+':'+place_ids[j] );
    }
  }

  console.log('Dates: '+dates);
  console.log('Co-occurence keys: '+coocurrence_keys);


  // Get the list of all places relevant for the given timestamp and place_id.
  req.redis_client.sunion(coocurrence_keys, function(err, timestamp_place_pairs){

    console.log('Timestamped place-pairs: '+timestamp_place_pairs);

    // Request, for each of these timestamp/place_pair combinations, the counts.
    place_counts = {};
    req.redis_client.hmget('timestamp:placepairs', timestamp_place_pairs, function(err, data){
      for(var i=0; i < timestamp_place_pairs.length; i++) {
        // Extract the recommended place_id from the key-string and combine it with its count-value.
        // TODO: getting ids by splitting on keys is not pretty, and will go wrong if
        // if the ids contain a ':'. We'll allow it in the first version.
        var rec_place_id = timestamp_place_pairs[i].split(':')[2];
        var count = parseInt(data[i]);
        if (rec_place_id in place_counts ) place_counts[rec_place_id] += count;
        else place_counts[rec_place_id] = count;

      }

      console.log(place_counts);
      // todo, make place_counts now a sorted list..

      res.json( {'status': 'accept', 'msg': 'Dummy recommendation', 'places': place_counts} );

    });

  });

});


module.exports = router;
