//Module contains two main functions for hiding and extracting data.


//Dependancies
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
var helpers = require("./helpers")


exports.prepPixel = function(red,green,blue){
	var pixel = new Object({red: red, green: green, blue: blue});

	//Convert all the colours to binary
	var redBin = ayb.decToBin(red);
	var greenBin = ayb.decToBin(green);
	var blueBin = ayb.decToBin(blue);

	var binaryArray = [redBin,greenBin,blueBin];
	for (var i in binaryArray){
		bin = binaryArray[i]
		if (bin.length < 8){
			var gap = 8 - bin.length;
			binaryArray[i] = pad(8,bin,'0');
		}
	}

	pixel.redBin = binaryArray[0];
	pixel.greenBin = binaryArray[1];
	pixel.blueBin = binaryArray[2];

	
	return pixel;
	
}