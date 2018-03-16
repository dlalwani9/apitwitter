var mongoose = require('mongoose');

var tweetSchema = new mongoose.Schema({
	id: Number,
	text: String,
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
	quote_count: Number,
	reply_count: Number,
	retweet_count: Number,
	favorite_count: Number,
	lang: String,
	timestamp: Number,
	hashtags: [String],
	urls: [String],
	user_mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
	quoted_status_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tweets'},
	retweeted_status_id: {type: mongoose.Schema.Types.ObjectId, ref: 'tweets'}
});

module.exports = mongoose.model('tweets', tweetSchema);
