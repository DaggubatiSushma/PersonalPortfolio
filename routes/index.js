var path=require('path')
var express = require('express');
var router = express.Router();
var data=require('../data/index.json')
var app=express();

router.get('/', function(req, res, next) {
  res.render('home',data);
});

router.get('/home', function(req, res, next) {
  res.render('home',data);
});


router.get('/about', function(req, res, next) {
  res.render('about',data);
});



router.get('/services', function(req, res, next) {
  res.render('services',data);
});

router.get('/projects', function(req, res, next) {
  res.render('projects',data);
});


router.get('/contact', (req, res) => {
  res.render('contact', {
    data: {},
    errors: {}
  });
});
const { check, validationResult, matchedData } = require('express-validator');

router.post('/contact', [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Please Enter atleaset four chars')
    .trim(),
  check('subject')
    .isLength({ min: 1 })
    .withMessage('Please enter at least 8 chars of subject')
    .trim(),
  check('message')
    .isLength({ min: 1 })
    .withMessage('Message is required')
    .trim(),
  check('email')
    .isEmail()
    .withMessage('That email doesn‘t look right')
    .bail()
    .trim()
    .normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('contact', {
      data: req.body,
      errors: errors.mapped()
    });
  }

  const data = matchedData(req);
  console.log('Sanitized: ', data);
  req.flash('success', 'Thanks for the message! I‘ll be in touch :)');
  res.redirect('/');
});
module.exports = router;