var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var getWord = require('./get-word');
var fs = require('fs');
var gis = require('google-images');
var probable = require('probable');
var _ = require('lodash');
var pickFirstGoodURL = require('pick-first-good-url');

var indexFileLocation = __dirname + '/data/index.txt';
var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var index;
var theWord;

var twit = new Twit(config.twitter);

async.waterfall(
  [
    getIndex,
    getWord,
    storeWord,
    gis.search,
    pickImage,
    postMedia,
    postTweet,
    saveNewIndex
  ],
  wrapUp
);

function getIndex(done) {
  index = +(fs.readFileSync(indexFileLocation));
  callNextTick(done, null, index);
}

function storeWord(word, done) {
  theWord = word;
  callNextTick(done, null, word);
}

function pickImage(images, done) {
  var imageURLs = probable.shuffle(_.pluck(images, 'url'));
  var pickOpts = {
    urls: imageURLs,
    responseChecker: isImageMIMEType,
    encoding: null
  };
  pickFirstGoodURL(pickOpts, done);
}

function postMedia(imageURL, imageResponse, done) {
  var postOpts = {
    media_data: new Buffer(imageResponse.body).toString('base64')
  };
  twit.post('media/upload', postOpts, done);
}

function postTweet(mediaPostData, response, done) {
  var text = theWord;

  if (dryRun) {
    console.log('Would have tweeted:', text);
    callNextTick(done, null, {});
  }
  else {
    var body = {
      status: text,
      media_ids: [
        mediaPostData.media_id_string
      ]
    };
    twit.post('statuses/update', body, done);
  }
}

function saveNewIndex(statusPostData, response, done) {
  index += 1;
  fs.writeFileSync(indexFileLocation, index.toString());
  callNextTick(done);
}

function wrapUp(error) {
  if (error) {
    console.log(error, error.stack);
  }
}

function isImageMIMEType(response, done) {
  callNextTick(
    done, null, response.headers['content-type'].indexOf('image/') === 0
  );
}
