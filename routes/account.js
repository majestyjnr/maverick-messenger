const express = require("express");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/authenticate");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Import Necesssary Models
const User = require("../models/Users");

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
router.get("/account", ensureAuthenticated,  function (req, res) {
  res.render("account/account", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/settings", ensureAuthenticated,  function (req, res) {
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

router.get("/import-contacts", ensureAuthenticated,  function (req, res) {
  res.render("dashboard/import-contacts", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/send-message", ensureAuthenticated,  function (req, res) {
  res.render("dashboard/send-message", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/sent-messages", ensureAuthenticated,  function (req, res) {
  res.render("dashboard/sent-messages", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/imported-contacts", ensureAuthenticated,  function (req, res) {
  res.render("dashboard/imported-contacts", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.get("/upgrade-package", ensureAuthenticated,  function (req, res) {
  res.render("dashboard/upgrade-package", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

module.exports = router;
