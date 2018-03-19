var mongoose = require('mongoose');
var async = require('async');

var User = require('../models/users');
var Tweet = require('../models/tweets');
//adding user
exports.add = (user, callback)=>{
  var newUser = {
    id: user.id
  }
  newUser.name = user.name;
  newUser.screen_name = user.screen_name;
  if(user.location) newUser.location = user.location;
  if(user.description) newUser.description = user.description;
  if(user.followers_count) newUser.followers_count = user.followers_count;
  if(user.statuses_count) newUser.statuses_count = user.statuses_count;
  if(user.url) newUser.url = user.url;

  // update user if present or create a nwe document in user collection
  User.findOneAndUpdate({id: newUser.id}, newUser, {new:true, upsert: true })
  .lean()
  .exec((err, user)=>{
    callback(err, user);
  });
}
