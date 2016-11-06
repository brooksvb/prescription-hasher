var express = require('express'),
  router = express.Router(),
  app = express(),
  Article = require('../models/article');

var sha1 = require('../models/sha1');
console.log(sha1);

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
  res.send(Sha1.hash('hello world', {msgFormat: 'string'}));
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

  hash = Sha1.hash(pre_string);

  /**
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

  } */


  return hash;
}



/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* SHA-1 (FIPS 180-4) implementation in JavaScript                    (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/sha1.html                                                       */
/*                                                                                                */
/*  - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                              */
/*        http://csrc.nist.gov/groups/ST/toolkit/examples.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';


/**
 * SHA-1 hash function reference implementation.
 *
 * This is a direct implementation of FIPS 180-4, without any optimisations. It is intended to aid
 * understanding of the algorithm rather than for production use, though it could be used where
 * performance is not critical.
 *
 * @namespace
 */
var Sha1 = {};


/**
 * Generates SHA-1 hash of string.
 *
 * @param   {string} msg - (Unicode) string to be hashed.
 * @param   {Object} [options]
 * @param   {string} [options.msgFormat=string] - Message format: 'string' for JavaScript string
 *   (gets converted to UTF-8 for hashing); 'hex-bytes' for string of hex bytes ('616263' ≡ 'abc') .
 * @param   {string} [options.outFormat=hex] - Output format: 'hex' for string of contiguous
 *   hex bytes; 'hex-w' for grouping hex bytes into groups of (4 byte / 8 character) words.
 * @returns {string} Hash of msg as hex character string.
 */
Sha1.hash = function(msg, options) {
    var defaults = { msgFormat: 'string', outFormat: 'hex' };
    var opt = Object.assign(defaults, options);

    switch (opt.msgFormat) {
        default: // default is to convert string to UTF-8, as SHA only deals with byte-streams
        case 'string':   msg = Sha1.utf8Encode(msg);       break;
        case 'hex-bytes':msg = Sha1.hexBytesToString(msg); break; // mostly for running tests
    }

    // constants [§4.2.1]
    var K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ];

    // initial hash value [§5.3.1]
    var H = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];

    // PREPROCESSING [§6.1.1]

    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

    // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
    var l = msg.length/4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
    var N = Math.ceil(l/16);  // number of 16-integer-blocks required to hold 'l' ints
    var M = new Array(N);

    for (var i=0; i<N; i++) {
        M[i] = new Array(16);
        for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
            M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) |
                (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

    // HASH COMPUTATION [§6.1.2]

    for (var i=0; i<N; i++) {
        var W = new Array(80);

        // 1 - prepare message schedule 'W'
        for (var t=0;  t<16; t++) W[t] = M[i][t];
        for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

        // 2 - initialise five working variables a, b, c, d, e with previous hash value
        var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];

        // 3 - main loop (use JavaScript '>>> 0' to emulate UInt32 variables)
        for (var t=0; t<80; t++) {
            var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
            var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) >>> 0;
            e = d;
            d = c;
            c = Sha1.ROTL(b, 30) >>> 0;
            b = a;
            a = T;
        }

        // 4 - compute the new intermediate hash value (note 'addition modulo 2^32' – JavaScript
        // '>>> 0' coerces to unsigned UInt32 which achieves modulo 2^32 addition)
        H[0] = (H[0]+a) >>> 0;
        H[1] = (H[1]+b) >>> 0;
        H[2] = (H[2]+c) >>> 0;
        H[3] = (H[3]+d) >>> 0;
        H[4] = (H[4]+e) >>> 0;
    }

    // convert H0..H4 to hex strings (with leading zeros)
    for (var h=0; h<H.length; h++) H[h] = ('00000000'+H[h].toString(16)).slice(-8);

    // concatenate H0..H4, with separator if required
    var separator = opt.outFormat=='hex-w' ? ' ' : '';

    return H.join(separator);
};


/**
 * Function 'f' [§4.1.1].
 * @private
 */
Sha1.f = function(s, x, y, z)  {
    switch (s) {
        case 0: return (x & y) ^ (~x & z);           // Ch()
        case 1: return  x ^ y  ^  z;                 // Parity()
        case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
        case 3: return  x ^ y  ^  z;                 // Parity()
    }
};

/**
 * Rotates left (circular left shift) value x by n positions [§3.2.5].
 * @private
 */
Sha1.ROTL = function(x, n) {
    return (x<<n) | (x>>>(32-n));
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Encodes multi-byte string to utf8 - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
 */
Sha1.utf8Encode = function(str) {
    return unescape(encodeURIComponent(str));
};


/**
 * Converts a string of a sequence of hex numbers to a string of characters (eg '616263' => 'abc').
 */
Sha1.hexBytesToString = function(hexStr) {
    hexStr = hexStr.replace(' ', ''); // allow space-separated groups
    var str = '';
    for (var i=0; i<hexStr.length; i+=2) {
        str += String.fromCharCode(parseInt(hexStr.slice(i, i+2), 16));
    }
    return str;
};
