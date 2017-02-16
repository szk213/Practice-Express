var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
import Account from "../app/models/Account";

passport.use(new LocalStrategy(
    function(mail, password, done) {
      Account.findOne({ mail: mail}, function(err, account) {
        if (err) { return done(err); }

        if (!account) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        account.verify(password, (err, result) => {
          if(err) {
            return done(err)
          }

          if(!result) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, account);
        });
      });
    }
));