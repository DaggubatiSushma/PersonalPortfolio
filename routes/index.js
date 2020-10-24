var path=require('path')
var express = require('express');
var app = express();
var session = require('express-session');
var flag=false
var router = express.Router();
var data=require('../data/index.json')
var app=express();
var SALT_WORK_FACTOR=10
const db = require("../config/db");
require("../config/business.model")
const dbName = "express_auth";
const collectionName = "business";
const mongoose=require('mongoose')
const Business=mongoose.model('Business');
mongoose.set('useFindAndModify', false);
var ObjectID = require('mongodb').ObjectID;
const usercollectionName = "users";


router.get('/', function(req, res) {
  res.render('login',data);
});

var bcrypt = require('bcrypt');
var BCRYPT_SALT_ROUNDS = 12;
router.get('/register', function (req, res, next) {
  var password = 'test'

  bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
    .then(function(hashedPassword) {
				db.initialize(dbName, usercollectionName, function(dbCollection) { 
			dbCollection.insert({
			  "username" : "test",
			  "hash" : hashedPassword			  
			});  
		  }, function(err) { 
			throw (err);
		  });
    })
    .then(function() {
        res.send();
    })
    .catch(function(error){
        console.log("Error saving user: ");
        console.log(error);
        next();
    });
});

router.post('/login',function(req, res) {
  console.log(req.body.username)
  db.initialize(dbName, usercollectionName, function(dbCollection) { 
    dbCollection.find({username:req.body.username}).toArray(function(err, result) {
        if (err) throw err;   
          console.log(result[0].username)
          user=result[0]
          if (user && bcrypt.compareSync(req.body.password, user.hash)) {
            console.log(true)
            flag=true
            res.redirect('home')
        }else{
          console.log(false)
          res.redirect('/')
        }
    });
  
  }, function(err) { 
    throw (err);
  });
});

function checkSignIn(req, res,next){
  if(flag==true){
    next();
  }
  else{
    res.redirect('/')
  }
}

router.get('/logout',checkSignIn,function (req, res)  {
  flag=false;
  res.redirect('/')
});

router.get('/home',checkSignIn, function(req, res) {
  res.render('home',data);
});

router.get('/about', checkSignIn,function(req, res, next) {
  res.render('about',data);
});

router.get('/services', checkSignIn,function(req, res, next) {
  res.render('services',data);
});

router.get('/projects', checkSignIn,function(req, res, next) {
  res.render('projects',data);
});



router.get('/contact',checkSignIn, (req, res) => {
  res.render('contact', {
    data: {},
    errors: {}
  });
});

const { check, validationResult, matchedData } = require('express-validator');

router.post('/contact', checkSignIn,[
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

router.get('/business', checkSignIn,function (req, res) {
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

router.get('/:id',checkSignIn,function (req, res) {     
          console.log(req.params.id)
          res.render('update',{user:req.params.id})
          
});

router.get('/delete/:id',checkSignIn,function (req, res) { 
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

router.post('/update', checkSignIn,function (req, res)  {
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