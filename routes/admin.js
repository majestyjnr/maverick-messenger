const express = require("express");
const router = express.Router();

router.get('/admin', function(req, res){
    res.send('This is the admin');
});

module.exports = router;