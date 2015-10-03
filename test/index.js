var expect    = require("chai").expect;
var index  = require("../index");
var prompt = require('prompt') // Used for handling user prompts
var Jimp = require('jimp') // Used for image manipulation
var ayb = require('all-your-base') //Used for converting between formats
var fs = require('fs') // Used for interacting with files
var pad = require('pad')
var path = require('path')
var binary = require('binary');
var fs = require('fs');
var BitArray = require('node-bitarray');
var binaryString = require('binary-string');


describe("sTego Main", function() {
  describe("fileToBinary", function() {
    it("Breaks the file down into an array of bits", function() {
      
      var returnString = index.fileToBinary("text.txt");

      var data = fs.readFileSync("text.txt")
      var bits = BitArray.fromBuffer(data);
      // console.log(data)
      // console.log("Binary buffer of file contents: " + data)
      // console.log("Binary buffer length: " + data.length)
      //convert file to binary array
      
      var bits = bits.join("");
      console.log(bits);
      console.log(returnString);
      expect(returnString).to.equal(bits);


    });
  });

  describe("stringToBinary", function() {
    it("Converts a string to binary", function() {     
     	
     	var buff = new Buffer('new Buffer("text.txt\u00005');
    	var string = binaryString.buff;
    	console.log(string);
    	var result = index.stringToBinary("text.txt\u00005");
    	expect(string).to.equal(result);

    });
  });


});