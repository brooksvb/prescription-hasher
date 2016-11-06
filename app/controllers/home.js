var express = require('express'),
  router = express.Router(),
  Article = require('../models/article');

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data


var firebase = require('firebase');

firebase.initializeApp({
  apiKey: "AIzaSyDOZHZ3wkAtU3WwNmjD0MD816b-L0BQ0qo",
  authDomain: "perscription-hasher.firebaseapp.com",
  databaseURL: "https://perscription-hasher.firebaseio.com",
  storageBucket: "",
  messagingSenderId: "383761577402"
});

var db = firebase.database();
var hashref = db.ref('hashes');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/test', function (req, res) {
  var sample_object = {
    lastname: 'vanburen',
    firstname: 'brooks',
    dob: '244',
    drug: 'accutane',
    gender: 'male',
    age: '19'
  }
  hashref.child(hasher(sample_object)).set({
    name: 'otherstring stuff'
  });
  res.send('did it work?');
});

router.get('/test2', function(req, res) {

  var sample_object = {
    lastname: 'vanburen',
    firstname: 'brooks',
    dob: '244',
    drug: 'accutane',
    gender: 'male',
    age: '19'
  }
  hashref.child('nonexistent').once('value', function(snapshot) {
    console.log(snapshot.val());
  });

  hashref.child(hasher(sample_object)).once('value', function(snapshot) {
    console.log(snapshot.val().name);

    res.send(snapshot.val().name);
  });
});

router.get('/', function (req, res, next) {
  var articles = [new Article(), new Article()];
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
});

router.post('/new_submission', upload.array(), function (req, res, next) {
  // Extract form data
  var data = req.body;

  if (!(user in data && contact in data && firstname in data && lastname in data && dob in data && age in data && gender in data && drug in data)) {
    res.send('<h3 id="response">ERROR: Not all parameters were present.</h3>');
  }

  // Hash the data
  var new_hash = hasher(data);


  // Check if hash exists
  hashref.child(new_hash).once('value').then(function(snapshot) {
    if (snapshot.val() !== null) {
      // Report that hash exists
      var return_html = '';

      return_html += '<div id="response"><h2>Collision detected:</h2>' +
        '<h1>Details of Collision:</h1>' +
        '<p>Collided entry was entered by: ' + snapshot.val().user + '.</p>' +
        '<p>Date of entry: ' + snapshot.val().date + '</p>' +
        '<p>Contact information for their office: ' + snapshot.val().contact + '</p>' +
        '<p>Please contact the office to confirm this duplicate perscription.</p></div>';

      res.send(return_html);

    } else {
      var d = new Date();
      var date = d.
      // Add hash to db
      hashref.child(new_hash).set({
        doctor: data.user,
        date: data.date,
        contact: data.contact
      });

      res.send('<div id="response"><h3>Successfully recorded entry without collisions.</h3></div>');
    }

  });  // End of db call

}); // End of post


// Return a single number from a string.
// Credit to http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
function mini_hash(string) {
  var hash = 0, i, chr, len;
  for (i = 0, len = string.length; i < len; i++)    {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}


/*
  Returns a hashed string of characters from a data object
*/
function hasher(data) {
  var pre_string = data.lastname + data.firstname + data.age + data.gender + data.dob + data.drug;
  var hash = '', curr_str;

  // Increment 5 characters at a time
  for (var i = 0, len = pre_string.length; i < len; i += 5) {
    curr_str = '';

    // Extract 5 characters at a time
    for (var j = 0; j < 5; j++) {
      if (pre_string[i + j]) {
        curr_str += pre_string[i + j]
      }
    }

    // Hash the characters and append to hash
    var temp = mini_hash(curr_str); // Get number from the string
    var fromCode = String.fromCharCode(mini_hash(curr_str));
    hash += fromCode;

    /*if (fromCode != undefined) {
      hash += fromCode;
    } else {
      hash += temp;
    }*/

  }

  return hash;
}
