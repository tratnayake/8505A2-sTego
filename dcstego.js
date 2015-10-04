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
var dcimage = require("./dcimage")
var dcutils = require("./dcutils");
var helpers = require("./helpers")



//If user has specified command line arguments
if(process.argv.length > 2){
	//If the argument was to hide
	if (process.argv[2] == "hide"){
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

	}
	//If the initial argument was to show (revealImage)
	else if(process.argv[2] == "show"){
		//FLOW 2: Revealing Image
		//console.log(process.argv);
		processRevealArgs()
		.then(dcimage.processSecretImage)
		.then(dcutils.revealSecretImage)
		.catch(
			function(error){
				console.log("ERROR HANDLING!");
				console.log(error)
			})

	}

}
//Else if user has not speciied any command line arguments
//Prompt user for details.
else{
	//DEBUG: console.log("User has entered no arguments, time to prompt");
	prompt.message = "sTego!".rainbow;
	prompt.delimiter = ">".blue;
	prompt.start()

	promptChoice()
	.then(processArgs)
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


}


function promptChoice(){
	return new Promise(function(resolve,reject){
		console.log("promptUser()")
				var schema = {
				    properties: {
				      embedFilePath: {
				       description: 'Please the path to the file you would like to embed within a carrier image',
				        required: true,
				      },
				      coverFilePath:{
				      	description: 'Please enter the path fo the file you would like to use as the carrier image',
				      	required: true,
				      },
				      outputFileName:{
				      	description: 'Please enter the name you would like the output file to have',
				      	required: true,
				      }
				    }
				  };
				prompt.get(schema, function(err,result){
					process.argv[3] = result.embedFilePath;
					process.argv[4] = result.coverFilePath;
					process.argv[5] = result.outputFileName;
					// var interPromisePackage = new Object({choice: result.choice})
					resolve(process.argv);
				})	
		})
}



function processRevealArgs(){
	return new Promise(function(resolve,reject){
		//DEBUG: console.log("Input are " + process.argv)
		var secretImageFilePath = process.argv[3];


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
		var embedFilePath = process.argv[3];
		var coverFilePath = process.argv[4];
		var outputFileName = process.argv[5];

		//Craft the ipp
		//Object: 
		//ipp
		// {
		// 	embedFilePath: text.txt,
		// 	coverFilePath: ./images/coverFile.bmp,
		// 	outputFileName: secretImage.bmp
		// }

		var ipp = new Object({embedFilePath: embedFilePath, coverFilePath: coverFilePath, outputFileName: outputFileName});
		//DEBUG: console.log(ipp);

		resolve(ipp);
	})
}
	




//2. Process the embed file
//   Grab the a. fileSize (in bytes) b. Parse into data bitArray
function processFiles(ipp){
	return new Promise(function(resolve,reject){
		//DBUG: console.log("processEmbedFile()");
		var embedfilePath = ipp.embedFilePath;
		var coverFilePath = ipp.coverFilePath;
		
		//console.log(filePath);
		//Get the file size, if the file exists
		if (fs.existsSync(embedfilePath)){
			var fileStats = fs.statSync(embedfilePath);
			ipp.embedFileSize = fileStats.size;
		;
		}
		else{
			reject("No file exists at " +filePath);
		}

		if(fs.existsSync(coverFilePath)){
			var fileStats = fs.statSync(coverFilePath);
			ipp.coverFileSize = fileStats.size;
		}

		//Break the file down into binary
		ipp.embedFileData = helpers.fileToBinary(ipp.embedFilePath);
		resolve(ipp);
		


	})
}
//3. Craft the header
// a. header = fileName + \n +[fileSize (in bytes)]
function craftHeader(ipp){
	//DEBUG: console.log("CraftHeader()");
	return new Promise(function(resolve,reject){
		var embedFilePath = ipp.embedFilePath;
		var embedFileName = path.basename(embedFilePath);
		var embedFileSize = ipp.embedFileSize;
		ipp.header = embedFileName + "\n" + embedFileSize+"\n";
		ipp.headerData = helpers.stringToBinary(ipp.header);
		//DEBUG: console.log(ipp.headerData);
		resolve(ipp);
	})
}

function enforceSizeConstraint(ipp){
	return new Promise(function(resolve,reject){
		//DEBUG: console.log(ipp);
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
		//DEBUG: console.log("Write data is");
		//DEBUG: console.log(ipp.writeData);
		resolve(ipp);
	})
}










	



