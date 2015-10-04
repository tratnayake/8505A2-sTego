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




//MAIN:
//FLOW 1: Hiding Image
processArgs()
.then(processFiles)
.then(craftHeader)
.then(enforceSizeConstraint)
.then(prepData)
.then(dcutils.stegoImage)
.catch(
	function(error){
		console.log("ERROR HANDLING");
		console.log(error);
	})


//FLOW 2: Revealing Image
// processRevealArgs()
// .then(processSecretImage)
// .then(unpackBitstream)
// .catch(
// 	function(error){
// 		console.log("ERROR HANDLING!");
// 		console.log(error)
// 	})
function processRevealArgs(){
	return new Promise(function(resolve,reject){
		var secretImageFilePath = process.argv[2];


		//Craft the ipp
		//Object: 
		//ipp
		// {
		// 	embedFilePath: text.txt,
		// 	coverFilePath: ./images/coverFile.bmp,
		// 	outputFileName: secretImage.bmp
		// }

		var ipp = new Object({secretImageFilePath: secretImageFilePath,});
		//console.log(ipp);
		resolve(ipp);
	})
}

//1. Grab command line arguments.
//node index.js <embedFilePath> <coverFilePath> <outputFileName> 
// add it into the ipp (InterPromisePackage) that will be sent between 
//promises
function processArgs(){
	return new Promise(function(resolve,reject){
		var embedFilePath = process.argv[2];
		var coverFilePath = process.argv[3];
		var outputFileName = process.argv[4];

		//Craft the ipp
		//Object: 
		//ipp
		// {
		// 	embedFilePath: text.txt,
		// 	coverFilePath: ./images/coverFile.bmp,
		// 	outputFileName: secretImage.bmp
		// }

		var ipp = new Object({embedFilePath: embedFilePath, coverFilePath: coverFilePath, outputFileName: outputFileName});
		//console.log(ipp);
		resolve(ipp);
	})
}
	




//2. Process the embed file
//   Grab the a. fileSize (in bytes) b. Parse into data bitArray
function processFiles(ipp){
	return new Promise(function(resolve,reject){
		console.log("processEmbedFile()");
		var embedfilePath = ipp.embedFilePath;
		var coverFilePath = ipp.coverFilePath;
		//console.log(filePath);
		//Get the file size, if the file exists
		if (fs.existsSync(embedfilePath)){
			var fileStats = fs.statSync(embedfilePath);
			ipp.embedFileSize = fileStats.size;
		}
		else{
			reject("No file exists at " +filePath);
		}

		if(fs.existsSync(coverFilePath)){
			var fileStats = fs.statSync(coverFilePath);
			ipp.coverFileSize = fileStats.size;
		}

		//Break the file down into binary
		ipp.embedFileData = exports.fileToBinary(ipp.embedFilePath);
		resolve(ipp);
		


	})
}
//3. Craft the header
// a. header = fileName + \n +[fileSize (in bytes)]
function craftHeader(ipp){
	return new Promise(function(resolve,reject){
		var embedFilePath = ipp.embedFilePath;
		var embedFileName = path.basename(embedFilePath);
		var embedFileSize = ipp.embedFileSize;
		ipp.header = embedFileName + "\n" + embedFileSize+"\n";
		ipp.headerData = exports.stringToBinary(ipp.header);
		console.log(ipp.headerData);
		resolve(ipp);
	})
}

function enforceSizeConstraint(ipp){
	return new Promise(function(resolve,reject){
		console.log(ipp);
		ipp.coverImage
		var image = new Jimp(ipp.coverFilePath, function (err, image) {
			//Number of bits that picture can fit
			//Numher of bits X pixels * Y pixels * 3 color channels each.

			var totalDataBits = (image.bitmap.height * image.bitmap.width) *3
			var totalDataBytes = totalDataBits * 0.125;
			
			

			console.log("File size provided is " + filesize(ipp.embedFileSize).human() +"and within limits");
			if (ipp.embedFileSize <= totalDataBytes){
				resolve(ipp);
			}
			else{
				console.log("Height: " + image.bitmap.height);
				console.log("Width: " + image.bitmap.width);
				console.log("Max size is " + totalDataBits + "bits or " + totalDataBytes + "bytes");
				reject ("File size too big!");
			}
		})
	})
}

//4. Ready the data for writing into LSBs
//	data = header + embedFileData 
function prepData(ipp){
	return new Promise(function(resolve,reject){
		var data = ipp.headerData + ipp.embedFileData;
		ipp.writeData = data;
		console.log("Write data is");
		console.log(ipp.writeData);
		resolve(ipp);
	})
}

//5. Perform steganography.




function processSecretImage(ipp){
	return new Promise(function(resolve,reject){
		ipp.data = new Array();
		console.log("ProcessSecretImage()");
		var image = new Jimp(ipp.secretImageFilePath, function(err,image){
			image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
			    // x, y is the position of this pixel on the image 
			    // idx is the position start position of this rgba tuple in the bitmap Buffer 
			    // this is the image 
			 
			    var red = this.bitmap.data[idx];
			    var green = this.bitmap.data[idx+1];
			    var blue = this.bitmap.data[idx+2];
			    var alpha = this.bitmap.data[idx+3];
			    
			    var pixel = prepPixel(red,green,blue);
			    ipp.data.push(pixel.redBin[7]);
			    ipp.data.push(pixel.greenBin[7]);
			    ipp.data.push(pixel.blueBin[7]);

			    // console.log(" X: " + x + " Y: " + y  + " with binary: " + pixel.redBin);
			    // console.log(" X: " + x + " Y: " + y  + " with binary: " + pixel.greenBin);
			    // console.log(" X: " + x + " Y: " + y  + " with binary: " + pixel.blueBin);

			 
			    // rgba values run from 0 - 255 
			    // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel 
			});
			ipp.data = ipp.data.join("");
			resolve(ipp);	
		})

	})
}

function unpackBitstream(ipp){
	return new Promise(function(resolve,reject){
		//console.log(ipp);
		console.log("unpackBitStream()");
		//console.log(ipp);
		var data = ipp.data;
		//split into 8 bit chucnks
		var bitArray = data.match(new RegExp('.{1,'+8+'}', 'g'));
		// console.log(bitArray.length);
		// console.log("\n".charCodeAt(0));

		// var newLines = new Array();
		// for (var i = 0; i < bitArray.length; i++) {
		// 	if(bitArray[i] == "00001000"){
		// 		newLines.push(i);
		// 	} 
		// };

		// console.log("The first two occurences of new lines are: " + newLines[0] + " & " + newLines[1]);
		// // //console.log(bitArray);
		  var decimalArray = new Array();

		 var testArray = bitArray.slice(0,128);
		 console.log(testArray);
		 for(var element in testArray){
		 	decimalArray.push(ayb.binToDec(testArray[element]));
		 }

		 console.log(decimalArray);

		 var unpackedString = String.fromCharCode.apply(String,decimalArray);
		 console.log(unpackedString);

		 var chunks = unpackedString.split("\n");
		 var fileName = chunks[0];
		 var fileSize = chunks[1];

		 console.log("File name is: " + fileName + " & File Size is: " + fileSize + "bytes"); 
	})
}

function processRevealArgs(){
	return new Promise(function(resolve,reject){
		var secretImageFilePath = process.argv[2];


		//Craft the ipp
		//Object: 
		//ipp
		// {
		// 	embedFilePath: text.txt,
		// 	coverFilePath: ./images/coverFile.bmp,
		// 	outputFileName: secretImage.bmp
		// }

		var ipp = new Object({secretImageFilePath: secretImageFilePath,});
		//console.log(ipp);
		resolve(ipp);
	})
}

	



