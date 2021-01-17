const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth_admin");

const Admin = require("../models/Admin");
const User = require("../models/Users");
const Message = require("../models/Messages");

router.get("/admin/login", function (req, res) {
  res.render("admin/login");
});

//Login Handler
router.post("/admin/login", function (req, res, next) {
  passport.authenticate("admin-local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/admin/logout", function (req, res) {
  req.logout();
  req.flash("success_msg", "You logged out successfully");
  res.redirect("/admin/login");
});

router.get("/admin/dashboard", ensureAuthenticated, function (req, res) {
  try {
    User.find(function (err, users) {
      Message.find(function (err, messages) {
        res.render("admin/dashboard", {
          userTotal: users.length,
          messageTotal: messages.length,
          fullname: req.user.firstname + " " + req.user.lastname,
          email: req.user.email,
        });
      });
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get("/admin/new-admin", ensureAuthenticated, function (req, res) {
  res.render("admin/register-admin", {
    fullname: req.user.firstname + " " + req.user.lastname,
    email: req.user.email,
  });
});

router.post("/admin/new-admin", ensureAuthenticated, function (req, res) {
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
      res.render("admin/register-admin", {
        errors,
        firstname,
        lastname,
        email,
      });
    } else {
      Admin.findOne({ email: email }).then((user) => {
        if (user) {
          errors.push({ msg: "An admin with this Email already exists" });
          res.render("admin/register-admin", {
            errors,
            firstname,
            lastname,
            email,
          });
        } else {
          const newAdmin = new Admin({
            firstname,
            lastname,
            email,
            userType: "Admin",
            password,
          });

          // Hash Password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAdmin.password, salt, (err, hash) => {
              if (err) throw err;

              newAdmin.password = hash;

              newAdmin
                .save()
                .then((user) => {
                  req.flash("success_msg", `Admin registered successfully`);
                  res.redirect("/admin/all-admins");
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

router.get("/admin/all-admins", ensureAuthenticated, function (req, res) {
  try {
    Admin.find(function (err, admins) {
      res.render("admin/all-admins", {
        admins: admins,
        fullname: req.user.firstname + " " + req.user.lastname,
        email: req.user.email,
      });
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

// ============================= USER MANAGEMENT ============================
router.get("/admin/all-users", ensureAuthenticated, function (req, res) {
  try {
    User.find(function (err, users) {
      res.render("admin/all-users", {
        users: users,
        fullname: req.user.firstname + " " + req.user.lastname,
        email: req.user.email,
      });
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.get(
  "/admin/all-sent-messages",
  ensureAuthenticated,
  function (req, res) {
    Message.find(function (err, messages) {
      res.render("admin/all-sent-messages", {
        messages: messages,
        fullname: req.user.firstname + " " + req.user.lastname,
        email: req.user.email,
      });
    });
  }
);

router.get("/admin/accredit-user", ensureAuthenticated, function (req, res) {
  try {
    res.render("admin/accredit-user", {
      fullname: req.user.firstname + " " + req.user.lastname,
      email: req.user.email,
    });
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});

router.post("/admin/accredit-user", ensureAuthenticated, function (req, res) {
  try {
    bcrypt.compare(
      req.body.confirmpassword,
      req.user.password,
      (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          User.find({ email: req.body.email }, function (err, theUser) {
            if (!theUser) {
              res.render("admin/accredit-user", {
                fullname: req.user.firstname + " " + req.user.lastname,
                email: req.user.email,
                error_msg: "User not found!",
              });
            } else {
              const addSMSPoints = {
                $inc: {
                  smsTotal: req.body.smsPoints,
                },
              };

              User.updateOne(
                { email: req.body.email },
                addSMSPoints,
                function (err, smsUpdated) {
                  if (!smsUpdated) {
                    res.render("admin/accredit-user", {
                      fullname: req.user.firstname + " " + req.user.lastname,
                      email: req.user.email,
                      error_msg: "Error updating SMS Points!",
                    });
                  } else {
                    User.find(function (err, users) {
                      res.render("admin/all-users", {
                        users: users,
                        fullname: req.user.firstname + " " + req.user.lastname,
                        email: req.user.email,
                        success_msg: "User' SMS points updated successfully!",
                      });
                    });
                  }
                }
              );
            }
          });
        } else {
          res.render("admin/accredit-user", {
            fullname: req.user.firstname + " " + req.user.lastname,
            email: req.user.email,
            error_msg: "Please provide a valid password!",
          });
        }
      }
    );
  } catch (error) {
    res.status(404).render("404", {
      error_msg: "Ooooops..... The page could not be found",
    });
  }
});
module.exports = router;
