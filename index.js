//Requirements
var prompt = require('prompt') // Used for handling user prompts
var Jimp = require('jimp') // Used for image manipulation
var ayb = require('all-your-base') //Used for converting between formats
var fs = require('fs') // Used for interacting with files





//MAIN:
prompt.message = "sTego!".rainbow;
prompt.delimiter = ">".blue;
prompt.start()
//Prompt user for the following information 1. Embed File (this will be hidden) , 2. outputFileName
promptUser()
// Grab that file and see how big it is. 
.then(checkEmbedFile)
//Prompt user for the cover Image
.then(promptCoverImage)
//Ensure that it's bigger
.then(checkCoverImage)
//Process image, get all the pixels with binary values for colours.
.then(processImage)
.then(console.log)
.catch(
	function(error){
		console.log("Error handling!");
		console.log(error);
	})













function promptUser(){
	return new Promise(function(resolve,reject){
				var schema = {
				    properties: {
				      embedFile: {
				       description: 'Please enter the file you wish to embed (this is the file that will be hidden within the cover image)',
				        required: true
				      }
				    }
				  };
				prompt.get(schema, function(err,result){
					var interPromisePackage = new Object({embedFilePath: result.embedFile})
					resolve(interPromisePackage);
				})	
		})
}

function checkEmbedFile(interPromisePackage){
	return new Promise(function(resolve,reject){
		var filePath = interPromisePackage.embedFilePath;
		if (fs.existsSync(filePath)){
			var fileStats = fs.statSync(filePath);
			var fileSize = fileStats.size;
			console.log("The embed file is: "+fileSize + " bytes in size")
			var coverImageSizeReq = fileSize * 8;
			console.log("The cover image must be > " +coverImageSizeReq+ "bytes in size");
			interPromisePackage.coverImageSizeReq = coverImageSizeReq;
			resolve(interPromisePackage);
		}
		else{
			reject("No file exists at " + filePath)
		}
	})
	
}

function promptCoverImage(interPromisePackage){
	return new Promise(function(resolve,reject){
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
		var filePath = interPromisePackage.coverImageFilePath;
		console.log("Cover Image Size is " + interPromisePackage.coverImageSizeReq);
		console.log(interPromisePackage);

		if (fs.existsSync(filePath)){
			console.log("File exists!")
			var fileStats = fs.statSync(filePath);
			var fileSize = fileStats.size;
				if(fileSize > interPromisePackage.coverImageSizeReq){
					resolve("Success!");
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





function processImage(interPromisePackage){
	return new Promise(function(resolve,reject){
		var pixelArray = new Array();
		var image = new Jimp(interPromisePackage.coverImageFilePath, function (err, image) {  
		   	image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
		   	    // x, y is the position of this pixel on the image 
		   	    // idx is the position start position of this rgba tuple in the bitmap Buffer 
		   	    // this is the image 
		   	 
		   	    var red = this.bitmap.data[idx];
		   	    var green = this.bitmap.data[idx+1];
		   	    var blue = this.bitmap.data[idx+2];
		   	    var alpha = this.bitmap.data[idx+3];
		   	 	
		   	 	// console.log(this.bitmap.data[idx])
		   	  //   console.log("X:"+x+"Y:"+y+" red: " + red +" green: " + green + " blue: " + blue + " alpha: " +alpha)
		   	  //   console.log(Jimp.intToRGBA(image.getPixelColor(x,y)));
		   	    var color = Jimp.intToRGBA(image.getPixelColor(x,y));
		   	    // console.log(Jimp.rgbaToInt(color.r,color.b,color.b,color.a));

		   	    //convert to binary
		   	    var pixelObject = {x: x, y: y, red: red, green: green, blue: blue, redBin: ayb.decToBin(red), greenBin: ayb.decToBin(green), blueBin: ayb.decToBin(blue)}
		   	    pixelArray.push(pixelObject)

	



		   	});
		});
		pixelArray
	})
}