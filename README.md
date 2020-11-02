# Twitter Api 

Made 4 Apis( Used Postman for sending requests)

* 1.) For Triggering a twitter stream and storing them into a NoSQL database(MongoDB) for keyword sent in request http://apitweets.herokuapp.com/tweets/stream

* 2.) To get the stored tweets and their metadata according to the filters sent in request http://apitweets.herokuapp.com/tweets/searchfilter

* 3.) For Exporting filtered data in csv http://apitweets.herokuapp.com/tweets/csv

* 4.) For stopping the twitter stream http://apitweets.herokuapp.com/tweets/stop

##  API Description ( Used Postman for sending requests)

#### Api 1 (Request)
```
{
	"stream":"kejriwal"
}
```

#### Api 1 (Response)
```
streaming is on
```

#### Api 2 (Request)
##### Any Field in the request may be omitted if its not needed 
```                 
//type can be "0"(starts with) or "1"(contains) or "2"(ends with)
{
	"search":{"type":"1", "text":"modi"},        //text contains the keyword for stream
	"date":{"from":"16-03-2018 16:42", "to":"19-03-2018 23:10"}, // format of from and to (Day-Month-Year Hours:Minutes)
	"lang":"en",            // filter based on language
	"hashtags":{"type":"1", "search":"n"},   //search contains the keyword to be searched in hashtags
	"urls":{"type":"2", "search":"208"},     //search contains the keyword to be searched in urls
	"retweet":{"min":2 },  //number of times tweet retweeted // can have three fields min(minimum value), max(maximum value), exact(exact value)
	"favorite":{"min":1, "max":20000}, //number of times tweet liked // can have three fields min(minimum value), max(maximum value), exact(exact value)
	"quoted":{ "exact":0}, //number of times tweet quoted // can have three fields min(minimum value), max(maximum value), exact(exact value)
	"mentionsName":{"search":"kumar", "type":"1"},   //search contains the keyword to be searched in user mentions name
	"mentionsScreenName":{"search":"sush", "type":"0"}, //search contains the keyword to be searched in user mentions screen_name
	"userName":{"search":"a", "type":"1"},           //search contains the keyword to be searched in user name 
	"userScreenName":{"search":"h", "type":"1"},     //search contains the keyword to be searched in user screen_name
	"statuses":{"min":100 },  // count of user statuses // can have three fields min(minimum value), max(maximum value), exact(exact value)
	"followers":{ "max":1000000}, // count of user followers // can have three fields min(minimum value), max(maximum value), exact(exact value)
	"perPage":10,   //maximum no. of documents in a page
	"pageNo":1,     //page number
	"sort":-1,     // 1 for ascending and -1 for descending
	"sortBy":"retweet_count" // feild by which it should be sorted, accepts all the elements given in array below
                                ['text', 'retweet_count', 'favorite_count','quote_count','reply_count', 'date']
}

Raw request for ease in use
{
	"search":{"type":"1", "text":"modi"},
	"date":{"from":"16-03-2018 16:42", "to":"19-03-2018 23:10"},
	"lang":"en",
	"hashtags":{"type":"1", "search":"n"},
	"urls":{"type":"2", "search":"208"},
	"retweet":{"min":2 },
	"favorite":{"min":1, "max":20000},
	"quoted":{ "exact":0},
	"mentionsName":{"search":"kumar", "type":"1"},
	"mentionsScreenName":{"search":"sush", "type":"0"},
	"userName":{"search":"a", "type":"1"},
	"userScreenName":{"search":"h", "type":"1"},
	"statuses":{"min":100 },
	"followers":{ "max":1000000},
	"perPage":10,
	"pageNo":1,
	"sort":-1,
	"sortBy":"retweet_count"
}
```

#### Api 2 (Sample Response)
```
[{
        "_id": "5aae9ce23ad318a81e70cdee",
        "id": 975418465015214100,
        "__v": 0,
        "urls": [
            "NA"
        ],
        "user_mentions": [
            {
                "_id": "5aae9cde3ad318a81e70cda9",
                "id": 3025754858,
                "__v": 0,
                "statuses_count": 404159,
                "followers_count": 61848,
                "description": "Believe humanism with justice & fair play is above all.Skeptic & liberal. Time to stand up, speak up & save our diverse, free country from bigotry & fascism",
                "location": "India",
                "screen_name": "geetv79",
                "name": "Geet V"
            }
        ],
        "hashtags": [
            "NA"
        ],
        "retweeted_status_id": {
            "_id": "5aae9ce13ad318a81e70cddb",
            "id": 975379101073715200,
            "__v": 0,
            "urls": [
                "https://twitter.com/CNNnews18/status/975347194961174528?s=19"
            ],
            "user_mentions": [],
            "hashtags": [
                "ModiTalksNoCanDo",
                "ReclaimIndia",
                "ChangeIsNow",
                "CongressPlenary"
            ],
            "timestamp": 1521383474000,
            "lang": "en",
            "retweet_count": 53,
            "favorite_count": 55,
            "user_id": "5aae9cde3ad318a81e70cda9",
            "reply_count": 7,
            "quote_count": 0,
            "text": "\"Jhola Uthakar Chala Jaoonga\" \nIs the Rhetoric of a Loser,\n\nAfter Sinking the Economy &amp; \nDevastating Millions  \n#ModiTalksNoCanDo\n\n#ReclaimIndia\n#ChangeIsNow\n#CongressPlenary\n\nhttps://t.co/FgSZYOUWf4"
        },
        "quoted_status_id": {
            "_id": "5aae9ce13ad318a81e70cde2",
            "id": 975347194961174500,
            "__v": 0,
            "urls": [
                "NA"
            ],
            "user_mentions": [],
            "hashtags": [
                "CongressPlenarySession",
                "RahulAttacksBJP"
            ],
            "timestamp": 1521375867000,
            "lang": "en",
            "retweet_count": 66,
            "favorite_count": 210,
            "user_id": "5aae9ce13ad318a81e70cddf",
            "reply_count": 109,
            "quote_count": 27,
            "text": "It sounds like the rhetoric of a loser: Defence Minister Nirmala Sitharaman on Rahul Gandhi's #CongressPlenarySession speech. #RahulAttacksBJP https://t.co/LLM4RgEuxS"
        },
        "timestamp": 1521392859115,
        "lang": "en",
        "retweet_count": 0,
        "favorite_count": 0,
        "user_id": {
            "_id": "5aae9ce23ad318a81e70cde6",
            "id": 39443572,
            "__v": 0,
            "statuses_count": 48109,
            "followers_count": 10863,
            "description": "बड़ी गुस्ताख़ है तेरी यादें, इन्हे सलीका सिखा दे, दस्तक भी नहीं देती और दिलमें ऊतर आती है !!! RT ≠ Endorsement - Follow=Followback                Unfollow=Block",
            "location": "World Planet",
            "screen_name": "Sameeer_123",
            "name": "`•.•⭐️ $ąʍ€€я ⭐️•.•´"
        },
        "reply_count": 0,
        "quote_count": 0,
        "text": "RT @geetv79: \"Jhola Uthakar Chala Jaoonga\" \nIs the Rhetoric of a Loser,\n\nAfter Sinking the Economy &amp; \nDevastating Millions  \n#ModiTalksNoCa…"
    }]
```
####  Api 3 responses will be saved in tweetsFiltered.csv

## Built With

* Node.js
* Express
* MongoDB & Mongoose
* Twit
* json-2-csv
* Async

### Installation

Install dependicies

```
$npm install
```

Run app

```
$npm start
```
