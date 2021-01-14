const express = require("express");
const router = express.Router();

// ======================== Auth ==========================
router.get('/login', function(req, res){
    res.render('auth/login');
});

router.get('/signup', function(req, res){
    res.render('auth/signup');
});



// ======================== Account ==========================
router.get('/account', function(req, res){
    res.render('account/account');
});

router.get('/settings', function(req, res){
    res.render('account/settings');
});



// ======================== Dashboard ==========================

router.get('/dashboard', function(req, res){
    res.render('dashboard/dashboard');
});

router.get('/import-contacts', function(req, res){
    res.render('dashboard/import-contacts');
});

router.get('/send-message', function(req, res){
    res.render('dashboard/send-message');
});

router.get('/sent-messages', function(req, res){
    res.render('dashboard/sent-messages');
});

router.get('/imported-contacts', function(req, res){
    res.render('dashboard/imported-contacts');
});

router.get('/upgrade-package', function(req, res){
    res.render('dashboard/upgrade-package');
});


module.exports = router;