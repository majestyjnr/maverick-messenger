const express = require('express');
const path = require('path');
const app = new express();

// Setting the template view engine
app.set("view engine", "ejs");

// BodyParser || To GET data from form
app.use(express.urlencoded({ extended: false }));

// Serving Static content
app.use(express.static(path.join(__dirname, "public")));

// Require the routes
const index = require("./routes/index");
const account = require("./routes/account");
const admin = require("./routes/admin");

// System Routes
app.use("/", index);
app.use("/", account);
app.use("/", admin);

const PORT = process.env.PORT || 2000;
app.listen(PORT, function(){
    console.log(`Server running on PORT ${PORT}`);
});