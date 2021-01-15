const express = require("express");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const mongoose = require('mongoose');
const app = new express();

// Require the MongoDb Connection String
const db = require("./config/db_config").MongoURI;

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('MongoDB is connected');
})

// Setting the template view engine
app.set("view engine", "ejs");

// BodyParser || To GET data from form
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash Middleware
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.upload_msg = req.flash("upload_msg");
  res.locals.error = req.flash("error");
  next();
});

// Serving Static content
app.use(express.static(path.join(__dirname, "public")));

// Require the routes
const index = require("./routes/index");
const account = require("./routes/account");
const admin = require("./routes/admin");
const { Mongoose } = require("mongoose");

// System Routes
app.use("/", index);
app.use("/", account);
app.use("/", admin);

const PORT = process.env.PORT || 2000;
app.listen(PORT, function () {
  console.log(`Server running on PORT ${PORT}`);
});
