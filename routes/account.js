const express = require("express");
const router = express.Router();

router.get('/dashboard', function(req, res){
    res.render('dashboard/dashboard');
});

router.get('/import-contacts', function(req, res){
    res.render('dashboard/import-contacts');
});

router.get('/dashboard', function(req, res){
    res.render('dashboard/dashboard');
});

router.get('/dashboard', function(req, res){
    res.render('dashboard/dashboard');
});

router.get('/dashboard', function(req, res){
    res.render('dashboard/dashboard');
});

// 

module.exports = router;