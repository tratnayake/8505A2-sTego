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


exports.processSecretImage = function(ipp){
	return new Promise(function(resolve,reject){
		ipp.data = new Array();
		//DEBUG: console.log("ProcessSecretImage()");
		//DEBUG: console.log(ipp);
		var image = new Jimp(ipp.secretImageFilePath, function(err,image){
			image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
			    // x, y is the position of this pixel on the image 
			    // idx is the position start position of this rgba tuple in the bitmap Buffer 
			    // this is the image 
			 
			    var red = this.bitmap.data[idx];
			    var green = this.bitmap.data[idx+1];
			    var blue = this.bitmap.data[idx+2];
			    var alpha = this.bitmap.data[idx+3];
			    
			    var pixel = exports.prepPixel(red,green,blue);
			    ipp.data.push(pixel.redBin[7]);
			    ipp.data.push(pixel.greenBin[7]);
			    ipp.data.push(pixel.blueBin[7]);

			    //DEBUG: console.log(" X: " + x + " Y: " + y  + " with binary: " + pixel.redBin);
			    //DEBUG: console.log(" X: " + x + " Y: " + y  + " with binary: " + pixel.greenBin);
			    //DEBUG: console.log(" X: " + x + " Y: " + y  + " with binary: " + pixel.blueBin);

			 
			    // rgba values run from 0 - 255 
			    // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel 
			});
			ipp.data = ipp.data.join("");
			resolve(ipp);	
		})

	})
}