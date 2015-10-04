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
var dcimage = require("dcimage")



//	 For each pixel in the picture, into the last bit of
exports.stegoImage = function(ipp){
	return new Promise(function(resolve,reject){
		var image = new Jimp(ipp.coverFilePath, function (err, image) {

			counter = 0;
		    // this is the image 
		    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
		        // x, y is the position of this pixel on the image 
		        // idx is the position start position of this rgba tuple in the bitmap Buffer 
		        // this is the image 
		     
		        var red = this.bitmap.data[idx];
		        var green = this.bitmap.data[idx+1];
		        var blue = this.bitmap.data[idx+2];
		        //var alpha = this.bitmap.data[idx+3];

		        //Switch out the LSB for your value

		        //Write red pixel first
		        
		  
		        if(counter < ipp.writeData.length){
		        	var pixel = dcimage.prepPixel(red,green,blue);
		        	//There's still stuff to write in the data.
		        	console.log("RED to write: " + ipp.writeData[counter]);
		        	pixel.redBinNew = pixel.redBin.slice(0,7) + ipp.writeData[counter];
		        	var colorInt = ayb.binToDec(pixel.redBinNew);
		        	this.bitmap.data[idx] = colorInt;
		        	//console.log("Operation #: " + counter + " X: " + x + " Y: " + y + " red changed to " + colorInt + "with binary: " + pixel.redBinNew);
		        	counter++;

		        }
		        if(counter < ipp.writeData.length){
		        	var pixel = dcimage.prepPixel(red,green,blue);
		        	//There's still stuff to write in the data.
		        	console.log("GREEN to write: " + ipp.writeData[counter]);
		        	pixel.greenBinNew = pixel.greenBin.slice(0,7) + ipp.writeData[counter];
		        	var colorInt = ayb.binToDec(pixel.greenBinNew);
		        	this.bitmap.data[idx+1] = colorInt;
		        	//console.log("Operation #: " + counter + " X: " + x + " Y: " + y + " green changed to " + colorInt + "with binary: " + pixel.greenBinNew);
		        	counter++;
		        }
		        if(counter < ipp.writeData.length){
		        	var pixel = dcimage.prepPixel(red,green,blue);
		        	//There's still stuff to write in the data.
		        	console.log("BLUE to write: " + ipp.writeData[counter]);
		        	pixel.blueBinNew = pixel.blueBin.slice(0,7) + ipp.writeData[counter];
		        	var colorInt = ayb.binToDec(pixel.blueBinNew);
		        	this.bitmap.data[idx+2] = colorInt;
		        	//console.log("Operation #: " + counter + " X: " + x + " Y: " + y + " blue changed to " + colorInt + "with binary: " + pixel.blueBin);
		        	counter++;
		        }


		    });
			//Check to make sure the number of bit operations ==  the number of bits that there were to write
			 if(counter == (ipp.writeData.length)){
			 	console.log("Counter: " + counter + " There were " + ipp.writeData.length + " bits written to file");
			 }
			 else{
			 	reject(console.log("Counter: " + counter + " There were " + ipp.writeData.length + " bits to file"));
			 }

			 //Write the file
			 image.write(ipp.outputFileName);

			 
		});
	})
}

export.revealSecretImage = function(ipp){
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
			   resolve("Finished")

		})

	})
}

