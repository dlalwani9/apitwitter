var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  id: Number,
	name: String,
	screen_name: String,
	location: String,
  description: String,
  followers_count: Number,
  statuses_count: Number,
  url: String
});

module.exports = mongoose.model('users', userSchema);
