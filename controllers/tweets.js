var mongoose = require('mongoose');
var async = require('async');
var moment = require('moment');

var Tweet = require('../models/tweets');

var User = require('./users');

var tweetsFilter = [];

// add tweets
exports.add = (tweet, callback)=>{
  // first add user of the tweet
  User.add(tweet.user, (err, user)=>{
    if(err)  callback();
    var timestamp = moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').valueOf();

    var newTweet = {
      id: tweet.id
    };
    newTweet.text = tweet.text;
    newTweet.quote_count = tweet.quote_count;
    newTweet.reply_count = tweet.reply_count;
    newTweet.user_id = user._id;
    newTweet.favorite_count = tweet.favorite_count;
    newTweet.retweet_count = tweet.retweet_count;
    newTweet.lang = tweet.lang;
    if(tweet.timestamp_ms) newTweet.timestamp = tweet.timestamp_ms;
    else newTweet.timestamp = timestamp;

    if(tweet.quoted) newTweet.quoted_status_id = tweet.quoted;
    if(tweet.retweet) newTweet.retweeted_status_id = tweet.retweet;
    var entities;
    if(tweet.extended_tweet){
        entities = tweet.extended_tweet.entities;
        newTweet.text = tweet.extended_tweet.full_text;
    }
    else entities = tweet.entities;

    var hashtags = [];
    var user_mentions = [];
    var urls = [];

    // pushing hashtags in tweet collection
    for(var i in entities.hashtags)    hashtags.push(entities.hashtags[i].text);
    if(hashtags.length==0) hashtags.push('NA');
    //pushing urls in tweet collection
    for(var i in entities.urls)  urls.push(entities.urls[i].expanded_url);
    if(urls.length==0) urls.push('NA');

    async.forEachOfSeries(entities.user_mentions, function(user, index, callback){
      // users of user_mentions being added to user collection
        User.add(user, (err, user)=>{
          console.log('User being added');
          user_mentions.push(user._id);
          callback();
        });
     },
     function(err){
      newTweet.hashtags = hashtags;
      newTweet.user_mentions = user_mentions;
      newTweet.urls = urls;

      // adding a tweet if it does not exist or else update the tweet.
      Tweet.findOneAndUpdate({id: tweet.id}, newTweet ,{new:true, upsert:true})
      .lean()
      .exec((err, tweet)=>{
        //console.log(tweet);
        callback(err, tweet);
      });

     });

  });
}

// making regex pattern for string searching
regexSuitable = (string, type)=>{
  var result;
  if(type==0)
  result='^'+string+'.*';
  else if(type==1)
  result='.*'+string+'.*';
  else if(type==2)
  result='.*'+string+'$';

  return result;
}

// for sorting
function predicateBy(sortBy, sort){
   return function(a,b){
      if( a[sortBy] > b[sortBy]){
          return 1*sort;
      }else if( a[sortBy] < b[sortBy] ){
          return -1*sort;
      }
      return 0;
   }
}

// for search and filtering
exports.searchAndFilter = (req, callback)=>{
  //initializing variables such that if less or no filters are given in requests
  var body=req.body, search='.*', hashtags='.*', urls='.*', mentionsName='.*', lang='.*', mentionsScreenName='.*';
  var userName='.*',userScreenName='.*', sortBy = "";
  var from = 42250000, to = Date.now(), perPage = 20, pageNo = 1, sort = 1;
  var retweet_min = -1, retweet_max = Date.now();
  var favorite_min = -1, favorite_max = Date.now();
  var quoted_min = -1, quoted_max = Date.now();
  var statuses_min = -1, statuses_max = Date.now();
  var followers_min = -1, followers_max = Date.now();

  if(body.retweet){
    if(body.retweet.min && body.retweet.min!='') retweet_min=body.retweet.min;
    if(body.retweet.max && body.retweet.max!='') retweet_max=body.retweet.max;
    if(body.retweet.exact && body.retweet.exact!='') {
      retweet_min = body.retweet.exact;
      retweet_max = body.retweet.exact;
    }
  }

  if(body.favorite){
    if(body.favorite.min && body.favorite.min!='') favorite_min=body.favorite.min;
    if(body.favorite.max && body.favorite.max!='') favorite_max=body.favorite.max;
    if(body.favorite.exact && body.favorite.exact!='') {
      favorite_min = body.favorite.exact;
      favorite_max = body.favorite.exact;
    }
  }

  if(body.quoted){
    if(body.quoted.min && body.quoted.min!='') quoted_min=body.quoted.min;
    if(body.quoted.max && body.quoted.max!='') quoted_max=body.quoted.max;
    if(body.quoted.exact && body.quoted.exact!='') {
      quoted_min = body.quoted.exact;
      quoted_max = body.quoted.exact;
    }
  }

  if(body.statuses){
    if(body.statuses.min && body.statuses.min!='') statuses_min=body.statuses.min;
    if(body.statuses.max && body.statuses.max!='') statuses_max=body.statuses.max;
    if(body.statuses.exact && body.statuses.exact!='') {
      statuses_min = body.statuses.exact;
      statuses_max = body.statuses.exact;
    }
  }

  if(body.followers){
    if(body.followers.min && body.followers.min!='') followers_min=body.followers.min;
    if(body.followers.max && body.followers.max!='') followers_max=body.followers.max;
    if(body.followers.exact && body.followers.exact!='') {
      followers_min = body.followers.exact;
      followers_max = body.followers.exact;
    }
  }

  if(body.perPage) perPage=body.perPage;
  if(body.pageNo) pageNo=body.pageNo;
  if(body.sort) sort=body.sort;
  if(body.sortBy && body.sortBy!='') sortBy=body.sortBy;
  if(sortBy!=''){
    if(sortBy=='date')
      sortBy='timestamp'
  }
  if(body.lang && body.lang!='') lang=regexSuitable(body.lang,1);
  if(body.search && body.search.text!='' && body.search.type!='') search=regexSuitable(body.search.text, body.search.type);
  if(body.hashtags && body.hashtags.search!='' && body.hashtags.type!='') hashtags=regexSuitable(body.hashtags.search, body.hashtags.type);
  if(body.urls && body.urls.search!='' && body.urls.type!='') urls=regexSuitable(body.urls.search, body.urls.type);
  if(body.mentionsName && body.mentionsName.search!='' && body.mentionsName.type!='') mentionsName=regexSuitable(body.mentionsName.search, body.mentionsName.type);
  if(body.mentionsScreenName && body.mentionsScreenName.search!='' && body.mentionsScreenName.type!='') mentionsScreenName=regexSuitable(body.mentionsScreenName.search, body.mentionsScreenName.type);
  if(body.userName && body.userName.search!='' && body.userName.type!='') userName=regexSuitable(body.userName.search, body.userName.type);
  if(body.userScreenName && body.userScreenName.search!='' && body.userScreenName.type!='' ) userScreenName=regexSuitable(body.userScreenName.search, body.userScreenName.type);
  if(body.date && body.date.from && body.date.from!=''){
    from = moment(body.date.from,'DD-MM-YYYY h:mm','en').valueOf();
  }
  if(body.date && body.date.to && body.date.to!=''){
    to = moment(body.date.to,'DD-MM-YYYY h:mm','en').valueOf();
  }

   // console.log(lang, mentionsName, mentionsScreenName, userName);
   //  console.log(followers_min);
   // console.log(followers_max);

   // applying search filters in the query
  Tweet.find({ $and:[ { timestamp :{ $gte: from, $lte: to }},
                      { lang: {$regex: lang ,$options:'i'} },
                      { retweet_count :{ $gte: retweet_min, $lte: retweet_max }},
                      { favorite_count :{ $gte: favorite_min, $lte: favorite_max }},
                      { quote_count :{ $gte: quoted_min, $lte: quoted_max }},
                      { text: {$regex: search ,$options:'i'} },
                      { hashtags: {$regex: hashtags ,$options:'i'} },
                      { urls: {$regex: urls ,$options:'i'} }]  })
  .lean()
  .populate('retweeted_status_id quoted_status_id')
  .populate({
            path: 'user_mentions',
            match: {
                      $and: [{ name: {$regex: mentionsName ,$options:'i'} },
                           { screen_name: {$regex: mentionsScreenName ,$options:'i'} }]

                   }
            })
  .populate({
            path: 'user_id',
            match: {
                      $and: [{ name: {$regex: userName ,$options:'i'} },
                             { screen_name: {$regex: userScreenName ,$options:'i'} },
                             { statuses_count :{ $gte: statuses_min, $lte: statuses_max }},
                             { followers_count :{ $gte: followers_min, $lte: followers_max }}]

                   }
            })
  .exec((err, tweets)=>{
    if((mentionsName!='.*' && mentionsName!='^.*' && mentionsName!='.*.*' && mentionsName!='.*$') ||
      (mentionsScreenName!='.*' && mentionsScreenName!='^.*' && mentionsScreenName!='.*.*' && mentionsScreenName!='.*$')){
          tweets = tweets.filter(function(tweet){
            return (tweet.user_mentions.length>0);
    });
   }

   tweets = tweets.filter(function(tweet){
     return (tweet.user_id);
   });
   if(sortBy!='')
   // sorting
   tweets = tweets.sort(predicateBy(sortBy, sort));
    // pagination
    var start = Math.max(pageNo-1,0)*perPage;
    var end = start+perPage;
    tweets = tweets.slice(start, end);
    tweetsFilter = tweets;
    if(err) callback(err,null);
    callback(null, tweets);
  });
};

exports.csvGenerate = (req, callback)=>{
    var tweetList = [];
    // making json array for csv file
    async.forEachOfSeries(tweetsFilter,
          function(tweet, index, callback1){
            var sample = {
              text: tweet.text
            }
            sample.date = moment(tweet.timestamp).format("DD-MM-YYYY HH:mm");
            sample.retweet_count = tweet.retweet_count;
            sample.favorite_count = tweet.favorite_count;
            sample.lang = tweet.lang;
            sample.quote_count  = tweet.quote_count;
            if(tweet.hashtags.length>0 && tweet.hashtags[0]!='NA')
            sample.hashtags = tweet.hashtags;
            else
            sample.hashtags = "null";

            if(tweet.urls.length>0 && tweet.urls[0]!='NA')
            sample.urls = tweet.urls;
            else
            sample.urls = "null";

            sample.reply_count = tweet.reply_count;

            if(tweet.retweeted_status_id)
            sample.retweeted_status_id = tweet.retweeted_status_id.id;
            else
            sample.retweeted_status_id = "null";

            if(tweet.quoted_status_id)
            sample.quoted_status_id = tweet.quoted_status_id.id;
            else
            sample.quoted_status_id = "null";

            if(tweet.user_mentions.length>0){
              var arr = [];

              for(var i in tweet.user_mentions){
                arr.push(tweet.user_mentions[i].screen_name);
              }
              sample.userMentionScreenName = arr;
            }
            else
            sample.userMentionScreenName = "null";

            sample.userId = tweet.user_id.id;
            sample.userName = tweet.user_id.name;
            sample.userScreenName = tweet.user_id.screen_name;
            sample.followers_count = tweet.user_id.followers_count;
            sample.statuses_count = tweet.user_id.statuses_count;
            if(tweet.user_id.location)
            sample.userLocation = tweet.user_id.location;
            else
            sample.userLocation = "null";

            tweetList.push(sample);
            callback1();
          },
          function(err){
            callback(err, tweetList);
          });
}
