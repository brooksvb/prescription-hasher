var express = require('express'),
  router = express.Router(),
  app = express(),
  Article = require('../models/article');

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(express.static(__dirname + '/public'));

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

/*router.get('/new_entry', function(req, res) {

  res.render('index.html');

}); */

router.post('/new_entry', upload.array(), function (req, res, next) {

  // Extract form data
  var data = req.body;
  var message = 'ERROR: The message was never updated.';

  console.log(data);
  console.log('before data check.');

  /*
  if (!(user in data && contact in data && firstname in data && lastname in data && dob in data && gender in data && drug in data)) {
    console.log('data was missing?');
    res.send('<h3 id="response">ERROR: Not all parameters were present.</h3>');
  }
  */

  console.log('We are before the hash.');
  // Hash the data
  var new_hash = hasher(data);

  console.log('new_hash: ' + new_hash);

  // Check if hash exists
  hashref.child(new_hash).once('value').then(function(snapshot) {
    console.log('in db access: ' + snapshot);
    console.log(snapshot.val());
    if (snapshot.val() !== null) {
      console.log('snapshot isnt null');
      // Report that hash exists

      var return_html = '<h2><strong>Collision detected!</strong></h2>' +
        '<h2>Details of Collision:</h2>' +
        '<p><strong>Collided entry was entered by:</strong> Dr. ' + snapshot.val().user + '</p>' +
        '<p><strong>Date of entry:</strong> ' + snapshot.val().date + '</p>' +
        '<p><strong>Contact information for their office:</strong> ' + snapshot.val().contact + '</p>' +
        '<p>Please contact the office to confirm this duplicate perscription.</p>';

      res.send({message: return_html});

    } else {
      console.log('snapshot is null');
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      var d = new Date();
      var date = monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
      console.log('date: ' + date);
      // Add hash to db
      console.log(data.user);
      hashref.child(new_hash).set({
        user: data.user,
        date: date,
        contact: data.contact
      });

      res.send({message: '<h3>Successfully recorded entry without collisions.</h3>'});
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
  var pre_string = data.lastname + data.firstname + data.gender + data.dob + data.drug;
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
