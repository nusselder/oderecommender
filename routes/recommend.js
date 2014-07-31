var express = require('express');
var router = express.Router();

var pretty_names; // Listed below, used in router.get('/:id',...

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

  // The numbers of days to consider.
  var days_back = 3;

  // The current time/date (simulated).
  var timestamp = '2014-07-03T07:34:12Z';

  // The place for which to get recommendations.
  var place_id = req.params.id;

  //console.log('Request: '+place_id+' : '+timestamp+' : -'+days_back);

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
  var place_ids = [place_id];
  // var place_ids = [place_id, 'faux venue id'];
  for(var i=0; i<dates.length; i++){
    for(var j=0; j<place_ids.length; j++) {
      coocurrence_keys.push( dates[i]+':'+place_ids[j] );
    }
  }

  //console.log('Dates: '+dates);
  //console.log('Co-occurence keys: '+coocurrence_keys);

  // Get the list of all places relevant for the given timestamp and place_id.
  req.redis_client.sunion(coocurrence_keys, function(err, timestamp_place_pairs){

    //console.log('Timestamped place-pairs: '+timestamp_place_pairs);

    req.redis_client.hmget('timestamp:placepairs', timestamp_place_pairs, function(err, data){

      // Request, for each of these timestamp/place_pair combinations, the counts.
      place_counts = {};

      for(var i=0; i < timestamp_place_pairs.length; i++) {

        // Extract the recommended place_id from the key-string and combine it with its count-value.
        // TODO: getting ids by splitting on keys is not pretty, and will go wrong if
        // if the ids contain a ':'. We'll allow it in the first version.
        var rec_place_id = timestamp_place_pairs[i].split(':')[2];
        var count = parseInt(data[i]);

        if (rec_place_id in place_counts ) place_counts[rec_place_id] += count;
        else place_counts[rec_place_id] = count;
      }

      //console.log(place_counts);

      // Addendum: Get all total counts. Note that these are not per date, which is acceptable
      // for the generated three-day static data sample.
      req.redis_client.hgetall('place_visits', function(err, place_visits){

        var places = [];

        if (req.query.normalised === undefined)
          // Popular vote.
          places = normalise.none(place_counts);

        else if (req.query.normalised === "count")
          // Available for comparison, "raw" normalisation.
          places = normalise.visits(place_counts, place_visits);

        else {
          // Normalise top X popular and rerank.
          var top_x = parseInt(req.query.normalised) || 25;
          places = normalise.rerank(place_counts, place_visits, top_x);
        }


        // Add venue names.
        if (req.query.names !== undefined)
          places = places.map(function(item){
            item.name = pretty_names[item.place_id];
            return item
          });

        //console.log(places);

        // Show only the top ten.
        if (req.query.all === undefined)
          places = places.slice(0,10);

        // TODO: perhaps, implement "pagination" on the slice
        var result = {'status': 'accept',
                      'msg': 'top ten results, descending',
                      'place_id': place_id}

        if (req.query.names !== undefined)
          result.name = pretty_names[place_id];

        result.places = places;

        res.json( result );

      });

    });

  // /req.redis_client(
  });

// /router.get(:id
});


// Normalisation methods.
// Arguments:
// place_counts: count of each candidate place.
// place_visits: total place visits (for normalisation).
// top_x: rerank top X popular vote.
var normalise = {


  // Don't do normalisation, rank based on raw visit count ("popular vote").
  none: function(place_counts) {

    // Create list of place objects with popular count.
    var places = Object.keys(place_counts).map(function(place_id){
      return {"place_id": place_id,
              "value": place_counts[place_id]};
    });

    // Sort by count, descending (as in the first element has the largest value).
    places.sort(function(p1,p2){return p2.value - p1.value});

    return places;
  },


  // Normalise by total number of visits.
  visits: function(place_counts, place_visits) {

    // Create list of place objects with normalised count.
    var places = Object.keys(place_counts).map(function(place_id){
      return {"place_id": place_id,
              "value": place_counts[place_id] / place_visits[place_id]};
    });

    // Sort by count, descending (as in the first element has the largest value).
    places.sort(function(p1,p2){return p2.value - p1.value});

    return places;
  },


  // Take top X popular vote, and rerank by normalised number of visits.
  rerank: function(place_counts, place_visits, top_x) {

    // Get the popular vote.
    var places = normalise.none(place_counts);

    // Get the top X.
    places = places.slice(0,top_x);

    // Update values with normalised values.
    places = places.map(function(item){
      return {"place_id": item.place_id,
              "value": item.value / place_visits[item.place_id]};
    });

    // Sort by count, descending (as in the first element has the largest value).
    places.sort(function(p1,p2){return p2.value - p1.value});

    return places;
  },


// /var normalisation =
};



// A mapping of venue ids to names, copied as is from csv (including encoding errors).
pretty_names = {
"0c674b9b-0b3b-47bf-a861-b9f7a6470c55": "Heineken Experience",
"fa8d207c-84e9-44dc-ad9a-2fa2cc5b6a86": "Koninklijk Paleis",
"476f52b0-a96f-457d-9f83-528321ceaf9f": "Hortus Botanicus",
"9265439c-bc12-4bab-b907-5d99aa1b632e": "Artis",
"5c7f06df-0d3c-4680-926e-91a6df629e94": "Diamant Museum",
"3adc9c82-e063-4272-9250-942a331b5c7b": "Holland Casino Amsterdam",
"d17e70df-1851-41dd-a27f-99bae778e577": "Rijksmuseum",
"cbf77bab-b6c9-4443-b62b-4ec7c01a7f52": "Van Gogh Museum",
"0505f9b2-6ead-46c8-bb9b-178ffe219c79": "Tropenmuseum",
"dd19da01-45a7-470a-b0df-a2feef783f77": "Anne Frankhuis",
"ea0764a9-620f-45d7-adee-e4e818dcb22e": "De Oude Kerk",
"3329e497-a157-440c-840f-69307ae362a7": "Science Center NEMO",
"dc512fe8-284d-41b5-a682-e68364b40ed2": "Museum van Loon",
"e3f3d6d7-eaf9-4d39-af37-b97ba8a21243": "Rembrandthuis",
"95404120-70b7-427f-bd55-485b7bd144a5": "Joods Historisch Museum",
"71aa0732-99a1-4c27-abaa-62d81a43a8b1": "Het Scheepvaartmuseum",
"468c504e-2c9d-4d69-8327-5bb63a4ab627": "Amsterdam Museum",
"b7901cd5-f597-4243-b5c2-759583b07c92": "Amsterdam Arena - World of Ajax Walk-In Tour",
"2ba2fa84-b735-4f8c-91c5-a2c7ded1b57d": "EYE Filmmuseum",
"9579b782-bb71-4027-b1e7-5d15e6035c77": "De Nieuwe Kerk",
"4a57161c-9ebc-4175-98f4-37f79d7c1763": "Hermitage Amsterdam",
"ef903344-0de1-4127-90dc-13db968e1875": "FoamﾠFotografie Museum Amsterdam",
"286711d8-02de-4ea3-9767-b626c52fdbb9": "Allard Pierson Museum",
"9097ed76-6af3-489c-a745-03343c3102b9": "Amsterdam Pipe Museum",
"c07649d4-9d95-468c-94c3-45d0dcb63332": "Bijbels museum - de Cromhouthuizen",
"0a7ae1e8-f698-4526-afe6-7d6ea33b4b36": "Bijzondere Collecties UvA",
"95662943-4465-44d0-a0df-dab591d338e5": "Cobra Museum of Modern Art",
"a01d8d50-e20c-4b56-a7d4-e88248b3640a": "de Appel arts centre",
"80cc5d9f-946a-4a96-bfb2-a9d61008470a": "Hollandsche Schouwburg",
"0d8774c5-1ee1-4e18-93c9-7c4d8a10e98a": "Museum Geelvinck Hinlopen Huis",
"3bcdfd73-44dd-43b0-be22-b2a308093006": "Huis Marseilleﾠ- Museum voor Fotografie",
"e3f3d6d7-eaf9-4d39-af37-b97ba8a21243": "Museum Het Rembrandthuis",
"7d869de4-71fc-4ce6-9534-a5988cc90041": "Museum Het Schip",
"4e39ce81-1b8f-48d4-ac7c-3dc8062fe1a3": "Museum Ons? Lieve Heer op Solder",
"7f736099-819c-4c08-9470-fd2de4112f55": "Museum Tot Zover",
"56031fef-3398-4d0a-910b-956f8e6ea0ec": "Museum Willet-Holthuysen",
"70d130e3-9b9c-472b-88a7-addcde21f22b": "Persmuseum",
"74e7ac2d-a108-492b-acd3-546ff4cd8db5": "Portuguese Synagoge",
"bda67090-7df7-47bd-aae8-ac27935c43ef": "Stadsarchief Amsterdam",
"4fb89255-8a30-4ca4-b043-8cb7b37ab471": "Stedelijk Museum",
"a0f6362d-f987-4af2-a060-f7ee2cb9790b": "Tassenmuseum Hendrikje",
"2cefd885-58aa-410b-87a4-d7e1f1df08c2": "Verzetsmuseum",
"257044c1-dc5b-47fd-9db2-349220309326": "Amsterdam Tulip Museum",
"a0102890-1e5e-4726-b26c-05b914368ae5": "Het Grachtenhuis",
"5684c855-5065-406b-b012-e9c4afea1e82": "Molen van Sloten & Kuiperijmuseum",
"29cbeea4-4617-4c27-b895-220cc68496c1": "Woonbootmuseum",
"4d06adb1-f654-4c14-abfd-537f84f7385c": "Amsterdam Dungeon",
"72c90325-6f66-4c05-8736-0aa548295951": "De Hollandsche Manege",
"0966a3f5-364b-4d54-a180-655fba8b312e": "Het Kattenkabinet",
"ccf9bb6a-e5db-43c8-8bef-d050828da610": "Holland International",
"0627e173-cd49-400b-abb9-a73e87fa0d7b": "House of Bols",
"07305352-3143-43d0-8bf5-907e6c0464cc": "Madame Tussauds",
"40445ab5-a18b-4c50-baa4-b04ac61e6f47": "Olympisch Stadion Amsterdam",
"bc9cd8dc-cd0e-48c4-8663-91a780827290": "XtraColdIcebar",
"66d680c2-7448-4427-9c40-4f2c1e4df853": "Het Koninklijk Concertgebouw",
"9f113cfe-1f0d-4a61-9553-3c73f3301981": "North Sea Jazz Club",
"534d4732-7693-49e9-bf27-275bfde20740": "Canal Bike",
"9121c785-51b7-47d1-a0d9-00042ebce0e4": "Canal Bus",
"f50f9d65-cf1b-418e-b72b-5a1ebf82569a": "Scooter Experience",
"40c3617a-f679-43a2-9fec-0fe661fdf798": "Beurs van Berlage Caf￩",
"efa03cae-b515-448d-8dc9-757d9f5104a7": "Brasserie de Poortﾠ(Hotel de Poort van Cleve)",
"c3ec2a09-afbd-432b-a17e-8fd34c3ba295": "Brasserie Schiller",
"b8db0d06-1c27-4224-8116-b05525d9d570": "Caulils Delicatessen",
"a9dca5a2-aaeb-4d11-9025-f8ab29d6e042": "Eetsalon Van Dobbenﾠde Pijp",
"7d7a1dff-4211-406c-beeb-ee5715ea2498": "Grand Caf� Amstelhoek",
"4028efb5-2971-46b7-8b11-4c3ea5eb6312": "Heffer Caf�'s, Salons & Brasserie",
"8d4c3896-7762-4b69-85bd-09809822c2d5": "Henri Willig Cheeseﾠ& More shops",
"54d3daf4-610d-4328-a657-65a05c047eb9": "Jonk Haringhandel",
"11c3a5ae-abe8-446a-8f08-bca13a6175c3": "Pancakes! Amsterdam",
"d52fff47-184e-4e99-85b2-ad0937d5bb55": "Rancho Argentinian Grill",
"52e65402-5403-467d-9251-9fc757149a8c": "Restaurant Blue",
"2a28af43-8dd3-4c6b-9f3c-3bb7aacde327": "Restaurant Caf� In de Waag",
"6abc5c20-e284-48e4-87a9-5508d523968e": "Restaurant Circlesﾠ(Hotel Casa 400)",
"674f122b-1e35-48ab-8275-b6008aa65910": "Restaurant Da Portare Via",
"9b7b3f89-f3c9-414b-8ff9-c072bd8a6ca0": "Restaurant de Kersentuinﾠ(Bilderberg Garden Hotel)",
"256b5510-6eb2-40c0-b041-f273dc232e56": "Restaurant IJ-kantine",
"78c9af9d-a314-47b7-a1fa-6e09acd2c49c": "Restaurant Looks",
"2ce61056-8736-488b-93b8-ef29109cd454": "Restaurant New Dorriusﾠ(Crowne Plaza Amsterdam City Centre)",
"9c526197-1ea7-40c1-a575-7307fcd8ae60": "Restaurant Pasta e Basta",
"b4d8471a-e9a0-4a41-ae35-c1f42705342f": "Reypenaer Tasting Room",
"5a108a4e-2083-4307-b444-735aef2d2e11": "Senses Restaurantﾠ(The Albus)",
"212a7174-83c1-415b-925c-2faa42c9b491": "The Pancake Bakery",
"12f756f1-6fb5-4430-859e-8173a0ab3819": "Wagamama",
"664ffdf6-caa5-4182-9ef7-ada9332d4786": "ARCAM Architectuurcentrum Amsterdam",
"5b3d9798-66ea-486a-8860-22b837dfb4b1": "de Bijenkorf",
"3d702209-d89e-4f76-afd9-3d138105a97a": "De Drie Fleschjes",
"853c93aa-4599-41ad-9d79-638902925dc9": "Eetsalon Van Dobben",
"14b9e1bb-6b48-4be2-8555-2d249973ee1b": "Gassan Diamonds",
"092619ea-4f34-47fb-9ff7-8f766fe527ed": "Heineken Brand Store",
"2aa4270d-1b55-43ee-a71d-05bf0417df53": "Zaanse Schans",
"013badb5-a4fc-4718-9d6d-5257151782b8": "Zaans Museum",
"fa9244a3-0145-4b79-bc7d-fd79d39bdcc7": "Museum van het Nederlandse Uurwerk",
"2d1de4a5-7bc3-4f15-b5b2-c1e68e1f46bd": "Zaanhopper",
"22c552a0-d5fe-4083-87e7-7cf69be4b935": "MolenmuseumﾠKoog aan de Zaan",
"f32eac5f-90ad-4be8-b6a3-374ad46e91fe": "Het Czaar Peterhuisje",
"9cada49a-c2dc-4af3-b268-b3c330ec6f67": "Het Jonge Schaap Houtzaagmolenﾠ- Zaanse Schans",
"d554563a-0d36-4ea8-b7fd-a5d7c3e81e05": "De Kat Verfmolenﾠ- Zaanse Schans",
"b9c075d6-32ed-4720-9a94-b6290c9dbd07": "De Zoeker Oliemolenﾠ- Zaanse Schans",
"3ed5c8e2-2e83-4bdc-8fbb-8746226bdb0a": "Catharina Hoeveﾠ(kaasboerderij)",
"bb140c9f-210c-4eef-9e43-a95f37cf340b": "De Saense Lelie",
"e450a762-6ca4-4998-8102-ff5f936cd2c7": "KooijmanﾠSouvenirs & Geschenken",
"0a127bc6-8279-4f7a-8866-97235316b4ff": "Restaurant de Hoop op d' Swarte Walvis",
"86268170-b538-412c-b007-ea56794dda8b": "Frans Hals Museum",
"42e998b5-790a-4a99-8fc7-3f0f347808f9": "Hotel Caf� Restaurant van den Hogen",
"011037a6-7755-4e54-ac0e-68ec1c2dda2e": "Restaurant Land en Zeezicht"
};

module.exports = router;
