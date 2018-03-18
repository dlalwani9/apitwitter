const express=require('express');
const router=express.Router();

var Twit = require('twit');
var async = require('async');
var json2csv = require('json-2-csv');

var User = require('../controllers/users');
var Tweet = require('../controllers/tweets');

var T = new Twit({
  consumer_key:         process.env.key,
  consumer_secret:      process.env.secret,
  access_token:         process.env.token,
  access_token_secret:  process.env.tokensecret,
  timeout_ms:           10*1000,  // optional HTTP request timeout to apply to all requests.
});

var arr=[], stream;
router.post('/stream',(req, res)=>{
  stream = T.stream('statuses/filter', { track: req.body.stream })

    stream.on('tweet', function (tweet) {

      async.waterfall([
          function(callback) {
            if(tweet.retweeted_status){
              Tweet.add(tweet.retweeted_status,(err, tweet)=>{
                if(err) callback(err, null);
                else callback(null, tweet._id );
              });
            }
            else callback(null, null);
          },
          function(retweet, callback) {
            if(retweet) tweet.retweet = retweet;

            if(tweet.quoted_status){
              Tweet.add(tweet.quoted_status,(err, tweet)=>{
                if(err) callback(err, null);
                else callback(null, tweet._id );
              });
            }
            else callback(null, null);

          },
          function(quoted, callback) {
            if(quoted) tweet.quoted = quoted;

            Tweet.add(tweet, (err, tweet)=>{
              if(err) callback(err, null);
              else callback(null, tweet);
            });
          }
      ], function (err, result) {
          if(err) console.log('Some Error Occured'+error);
          else console.log("tweet updated");
      });

      arr.push(tweet);
    });
  //  T.currentTwitStream = stream;
    res.send('streaming is on');
});

router.get('/stop',(req, res)=>{
  stream.stop();
  res.send('streaming stopped');

})

router.post('/searchfilter', (req, res)=>{
  Tweet.searchAndFilter(req, (err, tweets)=>{
    if(err) return res.json(err);
    else return res.json(tweets);
  });
});

router.get('/csv', (req, res)=>{
  Tweet.csvGenerate(req, (err, tweets)=>{
    if(err) return res.json(err);
    var options = {
    delimiter : {
        wrap  : '"', // Double Quote (") character
        field : ',', // Comma field delimiter
        array : ';', // Semicolon array value delimiter
        eol   : '\n' // Newline delimiter
    },
    prependHeader    : true,
    sortHeader       : false,
    trimHeaderValues : true,
    trimFieldValues  :  true,
    keys             : ['text', 'retweet_count', 'favorite_count','lang','quote_count','hashtags','urls','reply_count', 'retweeted_status_id', 'quoted_status_id', 'userMentionScreenName', 'userId', 'userName', 'userScreenName','followers_count', 'statuses_count', 'userLocation']
};
    // var fields = ['text', 'retweet_count', 'favorite_count','lang','quote_count','hashtags','urls','reply_count', 'retweeted_status_id', 'quoted_status_id', 'userMentionScreenName', 'userId', 'userName', 'userScreenName','followers_count', 'statuses_count', 'userLocation'];
    json2csv.json2csv(tweets,(err, csv)=>{
      if(err)  return res.json(err);
      res.setHeader('Content-disposition', 'attachment; filename=tweetsFiltered.csv');
      res.set('Content-Type', 'text/csv');
      res.send(csv);
    },options);
  });
});

module.exports=router;
