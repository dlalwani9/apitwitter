const express=require('express');
const router=express.Router();

var Twit = require('twit')

var User = require('../controllers/users');
var Tweet = require('../controllers/tweets');

var T = new Twit({
  consumer_key:         'omPhO9BgvD6J66X9YJazrpUm2',
  consumer_secret:      'TBuDWzFwy0IRJRCfeS6l16nOCNirrBQWwPeuGd71zColnoeU1F',
  access_token:         '310866250-AjQHiW7HpwqU5yu8y920jLXbgcdnSo3kHQeO2VCf',
  access_token_secret:  'd9pmi39W92rKDFk74jQepdlu0MqA12kvEqC9kJDcT8aFD',
  timeout_ms:           10*1000,  // optional HTTP request timeout to apply to all requests.
});

var arr=[], stream;
router.post('/stream',(req, res)=>{
  stream = T.stream('statuses/filter', { track: req.body.stream })

    stream.on('tweet', function (tweet) {
      Tweet.add(tweet,()=>{
        console.log("tweet updated");
      });
      arr.push(tweet);
    });
  //  T.currentTwitStream = stream;
    res.send('streaming is on');
});

router.get('/stop',(req, res)=>{
  stream.stop();
  res.json(arr);

})

router.post('/user',(req, res)=>{
  T.get('users/show', { screen_name: req.body.user },  function (err, data, response) {
  console.log(data);
  res.json(data)
  });
});

module.exports=router;
