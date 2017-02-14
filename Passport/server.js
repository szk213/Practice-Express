const cluster = require('cluster');
var express     = require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
const log4js = require('log4js');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  log4js.configure('config/log4js/master.json');
  for (var i = 0; i < numCPUs; i++) {
    // Create a worker
    cluster.fork();
  }
} else {
  log4js.configure('config/log4js/worker.json');
  const logger = log4js.getLogger('request');
  const app = express();

  // get our request parameters
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // log to console
  app.use(morgan('dev'));

  // Use the passport package in our application
  app.use(passport.initialize());

  // demo Route (GET http://localhost:8080)
  app.get('/', function(req, res) {
    logger.info('=====');
    res.send('Hello! The API is at http://localhost:' + port + '/api');
  });

  // Start the server
  app.listen(port);
  console.log('There will be dragons: http://localhost:' + port);

  // connect to database
  mongoose.connect(config.database);

  // pass passport for configuration
  require('./config/passport')(passport);

  // bundle our routes
  var apiRoutes = express.Router();

  // connect the api routes under /api/*
  app.use('/api', apiRoutes);

  // create a new user account (POST http://localhost:8080/api/signup)
  apiRoutes.post('/signup', function(req, res) {
    if (!req.body.name || !req.body.password) {
      res.json({success: false, msg: 'Please pass name and password.'});
    } else {
      var newUser = new User({
        name: req.body.name,
        password: req.body.password
      });
      // save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Username already exists.'});
        }
        res.json({success: true, msg: 'Successful created new user.'});
      });
    }
  });

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
      name: req.body.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // check if password matches
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(user, config.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
    });
  });

  // route to a restricted info (GET http://localhost:8080/api/memberinfo)
  apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
      var decoded = jwt.decode(token, config.secret);
      User.findOne({
        name: decoded.name
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
      });
    } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
    }
  });
}

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
