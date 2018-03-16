var mongoose = require('mongoose');
var async = require('async');

var Tweet = require('../models/tweets');

var User = require('./users');

exports.add = (tweet, callback)=>{
  User.add(tweet.user, (err, user)=>{
    if(err)  callback();

    var newTweet = {
      id: tweet.id
    };
    newTweet.text = tweet.text;
    newTweet.quote_count = tweet.quote_count;
    newTweet.reply_count = tweet.reply_count;
    newTweet.favorite_count = tweet.favorite_count;
    newTweet.lang = tweet.lang;
    newTweet.timestamp = tweet.timestamp_ms;

    var entities;
    if(tweet.extended_tweet){
        entities = tweet.extended_tweet.entities;
        newTweet.text = tweet.extended_tweet.full_text;
    }
    else entities = tweet.entities;

    var hashtags = [];
    var user_mentions = [];

    for(var i in entities.hashtags)    hashtags.push(entities.hashtags[i].text);

    async.forEachOfSeries(entities.user_mentions, function(user, index, callback){
        User.add(user, (err, user)=>{
          console.log('User being added');
          user_mentions.push(user._id);
          callback();
        });
     },
     function(err){
      newTweet.hashtags = hashtags;
      newTweet.user_mentions = user_mentions;

      Tweet.findOneAndUpdate({id: tweet.id}, newTweet ,{new:true, upsert:true})
      .lean()
      .exec((err, tweet)=>{
        console.log(tweet);
        callback();
      });

     });

  });
}
