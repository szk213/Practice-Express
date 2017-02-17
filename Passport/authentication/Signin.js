import passport from 'passport';
const JsonStrategy = require('passport-json').Strategy;
import Account from "../app/models/Account";

passport.use(new JsonStrategy({
    usernameProp: 'mail',
    passwordProp: 'password'
  },
  function(mail, password, done) {
    console.log("なぜこない？？");
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