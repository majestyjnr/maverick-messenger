const express = require("express");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/authenticate");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Import Necesssary Models
const User = require("../models/Users");
const Config = require("../models/Config");
const Message = require("../models/Messages");

// ======================== Auth ==========================
router.get("/", function (req, res) {
  res.render("auth/login");
});

// Sign In Handler
router.post("/", function (req, res, next) {
  try {
    passport.authenticate("user-local", {
      successRedirect: "/dashboard",
      failureRedirect: "/",
      failureFlash: true,
    })(req, res, next);
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/signup", function (req, res) {
  res.render("auth/signup");
});

// Sign Up Handler
router.post("/signup", function (req, res) {
  try {
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
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

// ======================== Account ==========================
router.get("/account", ensureAuthenticated, function (req, res) {
  try {
    res.render("account/account", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/user-settings", ensureAuthenticated, function (req, res) {
  try {
    res.render("account/settings", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success_msg", "You logged out successfully");
  res.redirect("/");
});

// ======================== Dashboard ==========================

router.get("/dashboard", ensureAuthenticated, function (req, res) {
  try {
    Message.find({ sender_id: req.user._id }, function (err, messages) {
      let notifications = [];
      messages.forEach(function (message) {
        notifications.push(message);
      });
      res.render("dashboard/dashboard", {
        firstname: req.user.firstname,
        fullname: req.user.firstname + " " + req.user.lastname,
        smsTotal: req.user.smsTotal,
        contactsTotal: req.user.contacts.length,
        sentMessagesTotal: notifications.length,
        email: req.user.email,
      });
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/import-contacts", ensureAuthenticated, function (req, res) {
  try {
    res.render("dashboard/import-contacts", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/send-message", ensureAuthenticated, function (req, res) {
  try {
    res.render("dashboard/send-message", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.post("/send-message", ensureAuthenticated, function (req, res) {
  try {
    let contacts = [];
    let recipients = req.body.contacts;
    recipients.split(/,\s,?/).forEach((number) => {
      contacts.push(number);
    });

    console.log(req.body.contacts);
    console.log(req.body.senderID);

    User.findById({ _id: req.user._id }, function (err, user) {
      if (user.smsTotal < contacts.length) {
        res.render("dashboard/send-message", {
          fullname: req.user.firstname + " " + req.user.lastname,
          email: req.user.email,
          contacts: req.body.contacts,
          message: req.body.message,
          error_msg: `You can't send SMS notifications to ${contacts.length} Recipient(s) at the moment. Kindly purchase some SMS credits to continue.`,
        });
      } else {
        // const newTotal = user.smsTotal - contacts.length;

        const incrementSMSTotal = {
          $inc: {
            smsTotal: -contacts.length,
          },
        };

        const newMessage = new Message({
          sender_id: req.user._id,
          sender: req.user.email,
          message: req.body.message,
          recipients: req.body.contacts,
          totalRecipients: contacts.length,
        });

        User.updateOne(
          { _id: req.user._id },
          incrementSMSTotal,
          function (err, increment) {
            newMessage.save();

            Config.find(function (err, data) {
              data.forEach(function (item) {
                const client = require("twilio")(
                  item.accountSid,
                  item.authToken
                );

                contacts.forEach((contact) => {
                  client.messages
                    .create({
                      body: `${req.body.message}`,
                      from: `${req.body.senderID}`,
                      to: `+233${contact}`,
                    })
                    .then((message) => {
                      console.table(message.date_created)
                      req.flash("success_msg", `Message sent successfully`);
                      res.redirect("/sent-messages");
                    });
                });
              });
            });
          }
        );
      }
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/sent-messages", ensureAuthenticated, function (req, res) {
  try {
    Message.find({ sender_id: req.user._id }, function (err, message) {
      res.render("dashboard/sent-messages", {
        fullname: req.user.firstname + " " + req.user.lastname,
        email: req.user.email,
        message: message,
      });
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/view-message", ensureAuthenticated, function (req, res) {
  try {
    Message.findById({ _id: req.query.id }, function (err, message) {
      if (message == undefined) {
        res.status(404).render("404", {
          error_msg: "Ooooops..... The page could not be found",
        });
      } else {
        res.render("dashboard/view-message", {
          fullname: req.user.firstname + " " + req.user.lastname,
          email: req.user.email,
          message: message,
        });
      }
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/imported-contacts", ensureAuthenticated, function (req, res) {
  try {
    res.render("dashboard/imported-contacts", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/upgrade-package", ensureAuthenticated, function (req, res) {
  try {
    res.render("dashboard/upgrade-package", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

module.exports = router;
