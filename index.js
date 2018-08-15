"use strict";

var http = require('http');
var path = require('path');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

execSync('node -v', {stdio:[0,1,2]});

app.use('/src', express.static('src'));
app.use('/bower_components', express.static('bower_components'));
app.use('/node_modules', express.static('node_modules'));
var server = app.listen(3000, function(){
  console.log('Server running at http://127.0.0.1:3000/');
});

app.get('/', function(req, res, next){
  res.sendFile(__dirname + '/index.html');
});

/*
app.post('/js2tag', function(req, res){
  console.log(req.body)
  var ret = "result"
  res.json({result:ret});
});
*/