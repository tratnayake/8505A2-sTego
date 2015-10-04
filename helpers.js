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
var dcutils = require("./dcutils");


exports.fileToBinary = function(filePath){
	var data = fs.readFileSync(filePath)
	var bits = BitArray.fromBuffer(data);
	var bitArray = bits.join("");
	return bitArray;


}

exports.stringToBinary = function(string){
	var data = new Buffer(string);
	var bits = BitArray.fromBuffer(data);
	var bitArray = bits.join("");
	return bitArray;
}