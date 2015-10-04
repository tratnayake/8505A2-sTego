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


//MAIN:
//FLOW 1: Hiding Image
// processArgs()
// .then(processEmbedFile)
// .then(craftHeader)
// .then(prepData)
// .then(stegoImage)
// //.then(unpack)
// .catch(
// 	function(error){
// 		console.log("ERROR HANDLING");
// 		console.log(error);
// 	})


//FLOW 2: Revealing Image
processRevealArgs()
.then(processSecretImage)
.then(unpackBitstream)
.catch(
	function(error){
		console.log("ERROR HANDLING!");
		console.log(error)
	})
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
	
		 var decimalArray = new Array();

		 var testArray = bitArray.slice(0,500);
		 //console.log(testArray);
		 var key = "\n";
		 var code = key.charCodeAt(0);
		 code = ayb.decToBin(code);
		 console.log(code);

		 if (code.length < 8){
			var gap = 8 - code.length;
			bitKey = pad(8,code,'0');
		}
		else{bitKey = code};

		console.log("Bit key is " + bitKey);
		//Hold the locations of the key markers
		var keyArray = new Array();
		for (var i = 0; i < testArray.length; i++) {
			if(testArray[i] == bitKey){
				keyArray.push(i);
			}
		};

		//Construct the header, first the filename
		var fileName = testArray.slice(0,keyArray[0]);
		//Convert to decimal values
		for (var i = 0; i < fileName.length; i++) {
			fileName[i] = ayb.binToDec(fileName[i])
		};
		console.log(fileName);
		var fileName = String.fromCharCode.apply(String,fileName);
		console.log("File name is " + fileName);

		var fileSize = testArray.slice(keyArray[0]+1,keyArray[1]);
		//Convert to decimal values
		for (var i = 0; i < fileSize.length; i++) {
			fileSize[i] = ayb.binToDec(fileSize[i])
		};
		console.log(fileSize);
		var fileSize = String.fromCharCode.apply(String,fileSize);
		console.log("File sizeis " + fileSize +"bytes long");

		var start = keyArray[1] + 1;
		var end  = parseInt(start) + parseInt(fileSize);
		console.log("Data starts @ " + start);
		console.log ("Data ends @" +  end);

		  var fileData =bitArray.slice(start, end);
		  console.log(fileData);

		  var byteArray = new Array();
		  for (var i = 0; i < fileData.length; i++) {
		    byteArray.push(ayb.binToDec(fileData[i]));
		  };
		  // console.log("byteArray is: " + byteArray);
		  //add to buffer
		  var buff = new Buffer(byteArray);
		  // console.log(buff);

		   console.log("Write file");
		  //console.log(ipp);
		  fs.writeFileSync('./output/'+fileName,buff,'binary');
		   console.log("DONE!");




	})
}
