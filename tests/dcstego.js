//Requirements
var prompt = require('prompt') // Used for handling user prompts
var Jimp = require('jimp') // Used for image manipulation
var ayb = require('all-your-base') //Used for converting between formats
var fs = require('fs') // Used for interacting with files
var pad = require('pad')
var path = require('path')
var binary = require('binary');
var BitArray = require('node-bitarray')
var exports = module.exports;
var filesize = require("file-size");
var dcimage = require("../dcimage")
var dcutils = require("../dcutils");
var helpers = require("../helpers")
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr'
var exec = require('child_process').exec;


describe("MAIN", function() {
   describe("Test 1 - CLI with all correct variables", function() {
       it("should detect malformed JSON strings", function(){
           process.argv[3] = "text.txt";
           process.argv[4] = "./images/secretImage.bmp";
           process.argv[5] = "secretImage.bmp"
           process.argv[6] = "password"


           runCommand("node ../dcstego.js hide ../text.txt ../images/coverImage.bmp secretImage.bmp test")
           .then(console.log);
           });	




       });
   });

//Helpers
function runCommand(command){
	return new Promise(function(resolve,reject){
		exec(command , function(error, stdout, stderr) {
             	resolve(stdout);
           });
	})
}