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

router.get('/:id', function(req, res) {

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

module.exports = router;
