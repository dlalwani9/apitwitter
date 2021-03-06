const express=require('express');
const path=require('path');
var bodyParser=require('body-parser');
var mongoose=require('mongoose');

//MLAB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/twitterapi");

var app=express();
const port=process.env.PORT || 5000;
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(express.static(path.join(__dirname,'public')));




// app.set('views',path.join(__dirname,'views'));
// app.set('view engine','pug');
//
// app.get('*',(req,res,next)=>{
//   res.locals.user=req.user||null;
//   next();
// });
//
app.get('/',(req,res)=>{
  res.send('home');
});

var tweets=require('./route/tweets');
// var users=require('./route/users');
 app.use('/tweets', tweets);
// app.use('/users',users);


app.listen(port,()=>{
  console.log(`Started server on port ${port}`);
});
