//Requirements
var prompt = require('prompt') // Used for handling user prompts
var Jimp = require('jimp') // Used for image manipulation
var ayb = require('all-your-base') //Used for converting between formats
var fs = require('fs') // Used for interacting with files
var pad = require('pad')
var path = require('path')
var binary = require('binary');




//MAIN:
prompt.message = "sTego!".rainbow;
prompt.delimiter = ">".blue;
prompt.start()

promptChoice()
.then(handleChoice)
.catch(
	function(error){
		console.log("Error handling!");
		console.log(error);
	})


function promptChoice(){
	return new Promise(function(resolve,reject){
		console.log("promptUser()")
				var schema = {
				    properties: {
				      choice: {
				       description: 'What would you like to do? [1] to embed an image, [2] to reveal',
				        required: true
				      }
				    }
				  };
				prompt.get(schema, function(err,result){
					var interPromisePackage = new Object({choice: result.choice})
					resolve(interPromisePackage);
				})	
		})
}

function promptSecretImage(){
	return new Promise(function(resolve,reject){
		console.log("promptSecretImage()")
				var schema = {
				    properties: {
				      secretImage: {
				       description: 'Please provide file path to the secret image',
				        required: true
				      }
				    }
				  };
				prompt.get(schema, function(err,result){
					var interPromisePackage = new Object({secretImageFilePath: result.secretImage})
					resolve(interPromisePackage);
				})	
		})
}


function handleChoice(interPromisePackage){
	var ipp = interPromisePackage;
	if(ipp.choice == "2"){
		promptSecretImage()
		.then(convertImagePixel)
		.then(pixelToBinary)
		.then(binaryToText)
		.catch(
			function(error){
				console.log("Error handling!");
				console.log(error);
			})
	}
	else{
		promptUser()
		// Grab that file and see how big it is. 
		.then(checkEmbedFile)
		//Prompt user for the cover Image
		.then(promptCoverImage)
		//Ensure that it's bigger. 
		.then(checkCoverImage)
		//Convert embed file to binary array
		.then(prepareEmbedFile)
		//Convert the output file name to a buffer to print into header
		.then(craftHeader)
		//Process image, get all the pixels with binary values for colours.
		.then(prepareCoverImage)
		//save the file
		.then(stegoImage)
		.catch(
			function(error){
				console.log("Error handling!");
				console.log(error);
			})
	}
}

function promptUser(){
	return new Promise(function(resolve,reject){
		console.log("promptUser()")
				var schema = {
				    properties: {
				      embedFile: {
				       description: 'Please enter the file you wish to embed (this is the file that will be hidden within the cover image)',
				        required: true
				      },
				      outputFile: {
				      	description: 'Please enter the name of the output file (with extension)',
				      	required: true
				      }
				    }
				  };
				prompt.get(schema, function(err,result){
					var interPromisePackage = new Object({embedFilePath: result.embedFile, embedFile: path.basename(result.embedFile), outputFileName: result.outputFile})
					resolve(interPromisePackage);
				})	
		})
}

//Check the size to ensure that the cover image can hide the secret file.
//header + (secretFile * 8)
function startHeader(interPromisePackage){
	return new Proise(function(resolve,reject){

	})
}

function checkEmbedFile(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log("checkEmbedFile()")
		var filePath = interPromisePackage.embedFilePath;
		var outputFileName = interPromisePackage.outputFileName;
		if (fs.existsSync(filePath)){
			var fileStats = fs.statSync(filePath);
			var fileSize = fileStats.size;
			console.log("The embed file is: "+fileSize + " bytes in size");
			var header = filePath + "\n" + "["+fileSize+"]\n";

			var coverImageSizeReq = header.length+ (fileSize * 8);

			console.log("The cover image must be > " +coverImageSizeReq+ "bytes in size");
			interPromisePackage.embedImageSize = fileSize;
			interPromisePackage.coverImageSizeReq = coverImageSizeReq;
			interPromisePackage.header = header;
			resolve(interPromisePackage);
		}
		else{
			reject("No file exists at " + filePath)
		}
	})
	
}

function promptCoverImage(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log("promptCoverImage()")
		prompt.start();
				var schema = {
				    properties: {
				      coverImageFile: {
				       description: 'Please enter the file you wish to use as the cover image (This must be larger than ' + interPromisePackage.coverImageSizeReq + ' bytes in size',
				        required: true
				      }
				    }
				  };
				
				prompt.get(schema, function(err,result){
					interPromisePackage.coverImageFilePath = result.coverImageFile;
					resolve(interPromisePackage);
				})	
		})
}

function checkCoverImage(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log("checkCoverImage()")
		var filePath = interPromisePackage.coverImageFilePath;
		console.log("Cover Image Size is " + interPromisePackage.coverImageSizeReq);
		console.log(interPromisePackage);

		if (fs.existsSync(filePath)){
			console.log("File exists!")
			var fileStats = fs.statSync(filePath);
			var fileSize = fileStats.size;
				if(fileSize > interPromisePackage.coverImageSizeReq){
					console.log("File is of satisfactory size")
					resolve(interPromisePackage);
				}
				else {
					reject("Cover image is too small to embed your message, coverImage is size: "+ interPromisePackage.coverImageSizeReq + " embed image is"+ fileSize+ "Please run again")
				}
		}
		else{
			reject("No file exists at " + filePath)
		}
	})
}




function prepareCoverImage(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log("prepareCoverImage()")
		var pixelArray = new Array();
			var filePath = interPromisePackage.coverImageFilePath;
			
			var image = new Jimp(interPromisePackage.coverImageFilePath, function (err, image) {  
			   	image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
			   	    // x, y is the position of this pixel on the image 
			   	    // idx is the position start position of this rgba tuple in the bitmap Buffer 
			   	    // this is the image 
			   	 
			   	    var red = this.bitmap.data[idx];
			   	    var green = this.bitmap.data[idx+1];
			   	    var blue = this.bitmap.data[idx+2];
			   	    
			   	 	
			   	 	// console.log(this.bitmap.data[idx])
			   	  //   console.log("X:"+x+"Y:"+y+" red: " + red +" green: " + green + " blue: " + blue + " alpha: " +alpha)
			   	  //   console.log(Jimp.intToRGBA(image.getPixelColor(x,y)));
			   	    var color = Jimp.intToRGBA(image.getPixelColor(x,y));
			   	    // console.log(Jimp.rgbaToInt(color.r,color.b,color.b,color.a));

			   	    //convert to binary
			   	    var pixelObject = {x: x, y: y, red: red, green: green, blue: blue, redBin: ayb.decToBin(red), greenBin: ayb.decToBin(green), blueBin: ayb.decToBin(blue)}
			   	    //console.log(pixelObject);
			   	    pixelArray.push(pixelObject)

		



			   	});
			interPromisePackage.pixelArray = pixelArray;
			resolve(interPromisePackage);
			});
			
		})
}

function prepareEmbedFile(interPromisePackage){
	console.log("prepareEmbedFile()")
	return new Promise(function(resolve,reject){
	    var data = fs.readFileSync(interPromisePackage.embedFilePath)
	    // console.log(data)
	    // console.log("Binary buffer of file contents: " + data)
	    // console.log("Binary buffer length: " + data.length)
	    //convert file to binary array
	    var binArray = new Array();
	    for (var i = 0; i < data.length; i++) {
	        binArray.push(data[i]);
	    };
	    // console.log("Binary array of file: " + binArray);
	    //convert to bit array
	    //If each individual element has less than 8 bits, pad with 0s.
	    var bitArray = new Array();
	    for (var i = 0; i < binArray.length; i++) {
	      var bin = ayb.decToBin(binArray[i]);
	      //if less than 8 bits, pad with 0s.
	      // console.log("Binary array element: + " + bin)
	      // console.log("BinArray length:" + bin.length)
	      if (bin.length < 8){
	        var gap =  8 - bin.length;
	        // console.log("Gap is " +gap);
	        bin = pad(8,bin,'0')
	        // console.log(bin + "\n");
	       
	      }
	      bitArray.push(bin);
	    };
	    var bitStream = bitArray.join("");
	    interPromisePackage.dataBuffer = bitStream;
	    resolve(interPromisePackage);
	  })
}

function craftHeader(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log("craftHeader()")
		console.log(interPromisePackage.bitStream)
		//Code the embeddedFileName to the first however many bits
		console.log(interPromisePackage.embedFile)
		var embedFileName = interPromisePackage.embedFile;
		//Craft the header
		var headerBuff = new Buffer(interPromisePackage.header)
		//headerBuff.write(embedFileName)
		console.log(headerBuff)

		var binArray = new Array();
		for (var i = 0; i < headerBuff.length; i++) {
		    binArray.push(headerBuff[i]);
		};
		// console.log("Binary array of file: " + binArray);
		//convert to bit array
		//If each individual element has less than 8 bits, pad with 0s.
		console.log("bin array");
		console.log(binArray);
		var bitArray = new Array();
		for (var i = 0; i < binArray.length; i++) {
		  var bin = ayb.decToBin(binArray[i]);
		  //if less than 8 bits, pad with 0s.
		  // console.log("Binary array element: + " + bin)
		  // console.log("BinArray length:" + bin.length)
		  if (bin.length < 8){
		    var gap =  8 - bin.length;
		    // console.log("Gap is " +gap);
		    bin = pad(8,bin,'0')
		    // console.log(bin + "\n");
		   
		  }
		  bitArray.push(bin);
		};
		var bitStream = bitArray.join("");
		interPromisePackage.headerBuffer = bitStream;
		//debugger;
		console.log(interPromisePackage);
		resolve(interPromisePackage);
		

	})	
}

function stegoImage(interPromisePackage){
	return new Promise(function(resolve,reject){

		var ipp = interPromisePackage;
		//write the header bits
		var counter = 0;
		//Set the pixels first
			//make some buffer arrays
		var headerBuffer = ipp.headerBuffer;
		var dataBuffer = ipp.dataBuffer;
		console.log(typeof(headerBuffer));
		console.log(typeof(dataBuffer));
		var totalDataBuffer = headerBuffer + dataBuffer;

		//For each pixel, set the rgb as something from the big buffer.
		for (var i = 0; i < ipp.pixelArray.length; i++) {
			var pixel = ipp.pixelArray[i];
			
				pixel.redBin[7] = totalDataBuffer.shift();
			
			
				pixel.greenBin[7] = totalDataBuffer.shift();
			
			
				pixel.blueBin[7] = totalDataBuffer.shift();
			
			
		};
		
		console.log("DONE!");
		//Start setting the pixels
		var image = new Jimp(ipp.coverImageFilePath,function(err,image){
			for (var i = 0; i < ipp.pixelArray.length; i++) {
				var pixel = ipp.pixelArray[i];
				//Grab the hex values of the pixel
				var r = ayb.binToDec(pixel.redBin);
				var g = ayb.binToDec(pixel.greenBin);
				var b = ayb.binToDec(pixel.blueBin);

				//Convert to hex because thats what the next method expects
				var hex = Jimp.rgbaToInt(r, g, b, 255);

				//Set the pixel
				image.setPixelColor(hex, pixel.x, pixel.y);

			};
			console.log("Finished setting pixels");
			image.write(ipp.outputFileName,function(err,result){
				if(err){
					console.log(err)
				}
				console.log(result);
			} );
		})

		
	})
}

function convertImagePixel(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log(interPromisePackage);

		var ipp = interPromisePackage;

		var filePath = ipp.secretImageFilePath;

		var pixelArray = new Array();
		
		var image = new Jimp(ipp.secretImageFilePath, function (err, image) {  
		   	image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
		   	    // x, y is the position of this pixel on the image 
		   	    // idx is the position start position of this rgba tuple in the bitmap Buffer 
		   	    // this is the image 
		   	 
		   	    var red = this.bitmap.data[idx];
		   	    var green = this.bitmap.data[idx+1];
		   	    var blue = this.bitmap.data[idx+2];
		   	    
		   	 	
		   	 	// console.log(this.bitmap.data[idx])
		   	  //   console.log("X:"+x+"Y:"+y+" red: " + red +" green: " + green + " blue: " + blue + " alpha: " +alpha)
		   	  //   console.log(Jimp.intToRGBA(image.getPixelColor(x,y)));
		   	    var color = Jimp.intToRGBA(image.getPixelColor(x,y));
		   	    // console.log(Jimp.rgbaToInt(color.r,color.b,color.b,color.a));
		   	    var redBin =ayb.decToBin(red);
		   	    var greenBin = ayb.decToBin(green);
		   	    var blueBin = ayb.decToBin(blue);
		   	   

		   	    if (redBin.length < 8){
		   	      var gap =  8 - redBin.length;
		   	      // console.log("Gap is " +gap);
		   	      redBin = pad(8,redBin,'0')
		   	      // console.log(bin + "\n");
		   	     
		   	    }

		   	    if (greenBin.length < 8){
		   	      var gap =  8 - greenBin.length;
		   	      // console.log("Gap is " +gap);
		   	      greenBin = pad(8,greenBin,'0')
		   	      // console.log(bin + "\n");
		   	     
		   	    }

		   	    if (blueBin.length < 8){
		   	      var gap =  8 - blueBin.length;
		   	      // console.log("Gap is " +gap);
		   	      blueBin = pad(8,blueBin,'0')
		   	      // console.log(bin + "\n");
		   	     
		   	    }

		   	   

		   	    //convert to binary
		   	    var pixelObject = {x: x, y: y, red: red, green: green, blue: blue, redBin: redBin, greenBin: greenBin, blueBin: blueBin}
		   	    //console.log(pixelObject);
		   	    pixelArray.push(pixelObject);
		   	    //console.log(pixelObject)

		   	});
		interPromisePackage.pixelArray = pixelArray;
		resolve(interPromisePackage);
		})
	})
}

function pixelToBinary(interPromisePackage){
	return new Promise(function(resolve,reject){
		console.log("pixelToBinary()");
		console.log("Before error?");
		//console.log(interPromisePackage.pixelArray);
		console.log("After error?");
		var bitArray = new Array();
		//For every pixel in pixel array, grab the rgba bins and add into an array
	
		//console.log(ipp);
		var pixel;
		for (var i = 0; i < interPromisePackage.pixelArray.length; i++) {
			
			bitArray.push(interPromisePackage.pixelArray[i].redBin[7]);
			bitArray.push(interPromisePackage.pixelArray[i].greenBin[7])
			bitArray.push(interPromisePackage.pixelArray[i].blueBin[7])
		};
		
		//console.log(bitArray);
		interPromisePackage.bitArray = bitArray.join("");
		//console.log(interPromisePackage.bitArray);
		//console.log(bitArray);
		resolve(interPromisePackage);

	})
}

function binaryToText(interPromisePackage){
	return new Promise(function(resolve,reject){
		var bitArray = interPromisePackage.bitArray.match(new RegExp('.{1,'+8+'}', 'g'));
		//console.log(bitArray);	

		var buffer = new Buffer(bitArray);

		var newArray = new Array();
		for (var i = 0; i < buffer.length; i++) {
			newArray.push(ayb.binToDec(buffer[i]));
		};

		//console.log(newArray.toString());
		console.log(newArray.slice(0,5));
	})
}


//Helper functions
function toBinary(buffer){
	return new Promise(function(resolve,reject){
		
	})
}