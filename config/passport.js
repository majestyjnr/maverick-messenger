const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const moment = require("moment");

// Load the necessary models
const User = require("../models/Users");
const Admin = require("../models/Admin");


module.exports = function (passport) {
  passport.use(
    "user-local",
    new LocalStrategy(
      { usernameField: "email" },
      function (email, password, done) {
        User.findOne({ email: email })
          .then((user) => {
            if (!user) {
              // No user registered with the entered email
              return done(null, false, {
                message: "The email entered isn't registered",
              });
            }
            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Incorrect Password" });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.use(
    "admin-local",
    new LocalStrategy(
      { usernameField: "email" },
      function (email, password, done) {
        Admin.findOne({ email: email })
          .then((user) => {
            if (!user) {
              // No user registered with the entered email
              return done(null, false, {
                message: "The email entered isn't registered",
              });
            }
            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Incorrect Password" });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.serializeUser(function (user, done) {
    var key = {
      id: user.id,
      type: user.userType,
    };
    done(null, key);
  });

  passport.deserializeUser(function (key, done) {
    var Model = key.type === "user" ? User : Admin;
    Model.findById({ _id: key.id }, function (err, user) {
      done(err, user);
    });
  });
};
