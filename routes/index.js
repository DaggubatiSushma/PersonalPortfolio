var path=require('path')
var express = require('express');
var router = express.Router();
var data=require('../data/index.json')
var app=express();

const db = require("../config/db");
require("../config/business.model")
const dbName = "express_auth";
const collectionName = "business";
const mongoose=require('mongoose')
const Business=mongoose.model('Business');
mongoose.set('useFindAndModify', false);
var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res) {
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
const { ObjectId } = require('mongodb');

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

router.get('/business', function (req, res) {
  db.initialize(dbName, collectionName, function(dbCollection) { 

    dbCollection.find().sort({"name":1}).toArray(function(err, result) {
        if (err) throw err;
          console.log(result);
          res.render('list',{data:result});
    });
  
  }, function(err) { 
    throw (err);
  });
});

router.get('/:id',function (req, res) {     
          console.log(req.params.id)
          res.render('update',{user:req.params.id})
          
});

router.get('/delete/:id',function (req, res) { 
  console.log(req.params.id)
  db.initialize(dbName, collectionName, function(dbCollection) { 

    dbCollection.deleteOne(
      { "_id": ObjectID(req.params.id)})
      .then((obj) => {
          console.log('Updated - ' + obj);
          res.redirect('/business')
      })
      .catch((err) => {
          console.log('Error: ' + err);
      })
  
  }, function(err) { 
    throw (err);
  });
});

router.post('/update', function (req, res)  {
  db.initialize(dbName, collectionName, function(dbCollection) { 

    dbCollection.updateOne(
      { "_id": ObjectID(req.body._id)}, // Filter
      {$set: {"name": req.body.name,"contact":req.body.contact,"email":req.body.email}}
      )
      .then((obj) => {
          console.log('Updated - ' + obj);
          res.redirect('business')
      })
      .catch((err) => {
          console.log('Error: ' + err);
      })
  
  }, function(err) { 
    throw (err);
  });
});


module.exports = router;