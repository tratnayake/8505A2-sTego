var fs = require('fs');
var ayb = require('all-your-base')
var pad = require('pad')
var Jimp = require('Jimp');






  //Try it the other way around. Test going from bitstream to bits (every 8)
  // then convert those bits to decimals(binArray)
  // then write that binarray to a file


  

//Helper Functions
function examineBitmap(filePath){

  var data = fs.readFileSync(filePath)
  console.log(data)


}

function convertFileToBinary(filePath){
  return new Promise(function(resolve,reject){
    var data = fs.readFileSync(filePath)
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
    resolve(bitStream);
  })
}

function convertBinaryToFile(bitStream){
    
    //Start with the binary stream
    // console.log(bitStream)
    //split on every 8 to get the binary array elements
    var bitArray = new Array();
    bitArray = bitStream.match(new RegExp('.{1,'+8+'}', 'g'));
    // console.log("Bit array is: " + bitArray);
    //convert each element to decimal and place into binary buffer
    var binArray = new Array();
    for (var i = 0; i < bitArray.length; i++) {
      binArray.push(ayb.binToDec(bitArray[i]));
    };
    // console.log("binArray is: " + binArray);
    //add to buffer
    var buff = new Buffer(binArray);
    // console.log(buff);

     console.log("Write file");
    fs.writeFileSync('./images/coverImageTest.bmp',buff,'binary');
     console.log("DONE!");
}