const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const api = require('./api');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const expressSession=require('express-session');


app.use('/',api)

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//Authentication middleware
app.use(expressSession({ secret: 'thisIsASecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log(user);
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new LocalStrategy(
//    { passReqToCallback : true},
  function(username, password, done) {
    if ((username === "john") && (password === "password")) {
      return done(null, { username: username, id: 1 });
    } else {
      return done(null, false, "Failed to login.");
    }
  }
));


app.get('/userDetails', function (req, res){
  if (req.isAuthenticated()){
    res.send(req.user);
  } else {
    res.redirect('/login');
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?err',
}));

// Catch all other routes and return the index file
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/logout', function (req, res) {
  req.logout();
  res.send('Logged out!');
});
function authOnly(req,res,next){
  if (req.isAuthenticated()){
     next();
  } else {
      res.redirect('/login');
  }
}

app.get('/getUserDetails', authOnly, function (req, res){ 
  res.send(req.user); 
});

// Point static path to dist
app.use(authOnly,express.static(path.join(__dirname, 'dist')));

// Catch all other routes and return the index file
app.get('*',authOnly, (req, res) => { 
  res.sendFile(path.join(__dirname, '../public/index.html')); 
});
 // Catch all other routes and return the index file
app.use((err, req, res, next) => {
    res.status(500).send(err);
  });


if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  }
  
app.listen(port, () => console.log(`Example app listening on port ${port}!`))