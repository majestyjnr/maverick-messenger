const express = require("express");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/authenticate");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Import Necesssary Models
const User = require("../models/Users");
const Config = require("../models/Config");

// ======================== Auth ==========================
router.get("/", function (req, res) {
  res.render("auth/login");
});

// Sign In Handler
router.post("/", function (req, res, next) {
  passport.authenticate("user-local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
    failureFlash: true,
  })(req, res, next);
});

router.get("/signup", function (req, res) {
  res.render("auth/signup");
});

// Sign Up Handler
router.post("/signup", function (req, res) {
  const { firstname, lastname, email, password, confirmpassword } = req.body;

  let errors = [];

  if (password != confirmpassword) {
    errors.push({ msg: "Passwords do not match" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("auth/signup", {
      errors,
      firstname,
      lastname,
      email,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("auth/signup", {
          errors,
          firstname,
          lastname,
          email,
        });
      } else {
        const newUser = new User({
          firstname,
          lastname,
          email,
          phone: "NULL",
          smsTotal: 0,
          contacts: [],
          sentMessagesTotal: 0,
          userType: "user",
          password,
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            newUser.password = hash;

            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  `You have been registered successfully`
                );
                res.redirect("/");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// ======================== Account ==========================
router.get("/account", ensureAuthenticated, function (req, res) {
  res.render("account/account", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/settings", ensureAuthenticated, function (req, res) {
  res.render("account/settings", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success_msg", "You logged out successfully");
  res.redirect("/");
});

// ======================== Dashboard ==========================

router.get("/dashboard", ensureAuthenticated, function (req, res) {
  res.render("dashboard/dashboard", {
    firstname: req.user.firstname,
    fullname: req.user.firstname + " " + req.user.lastname,
    smsTotal: req.user.smsTotal,
    contactsTotal: req.user.contacts.length,
    sentMessagesTotal: req.user.sentMessagesTotal,
    email: req.user.email,
  });
});

router.get("/import-contacts", ensureAuthenticated, function (req, res) {
  res.render("dashboard/import-contacts", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/send-message", ensureAuthenticated, function (req, res) {
  res.render("dashboard/send-message", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.post("/send-message", ensureAuthenticated, function (req, res) {
  let contacts = [];
  let recipients = req.body.contacts;
  recipients.split(/,\s,?/).forEach((number) => {
    contacts.push(number);
  });

  console.log(req.body.contacts);

  User.findById({ _id: req.user._id }, function (err, user) {
    if (user.smsTotal < contacts.length) {
      res.render("dashboard/send-message", {
        fullname: req.user.firstname + " " + req.user.lastname,
        email: req.user.email,
        contacts: req.body.contacts,
        message: req.body.message,
        error_msg: `You can't send notifications to ${contacts.length} Recipients at the moment. Kindly purchase some SMS credits to continue.`,
      });
    } else {
      // const newTotal = user.smsTotal - contacts.length;

      const incrementSMSTotal = {
        $inc: {
          smsTotal: -contacts.length,
        },
      };

      User.updateOne(
        { _id: req.user._id },
        incrementSMSTotal,
        function (err, increment) {
          Config.find(function (err, data) {
            data.forEach(function (item) {
              const client = require("twilio")(item.accountSid, item.authToken);

              contacts.forEach((contact) => {
                client.messages
                  .create({
                    body: `${req.body.message}`,
                    from: "+13128746090",
                    to: `+233${contact}`,
                  })
                  .then((message) =>
                    res.render("dashboard/sent-messages", {
                      fullname: req.user.firstname + " " + req.user.lastname,
                      email: req.user.email,
                      success_msg: "Message sent successfully",
                    })
                  );
              });
            });
          });
        }
      );
    }
  });
});

router.get("/sent-messages", ensureAuthenticated, function (req, res) {
  res.render("dashboard/sent-messages", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/imported-contacts", ensureAuthenticated, function (req, res) {
  res.render("dashboard/imported-contacts", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/upgrade-package", ensureAuthenticated, function (req, res) {
  res.render("dashboard/upgrade-package", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

module.exports = router;
