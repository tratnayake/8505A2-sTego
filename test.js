var fs = require('fs');
var ayb = require('all-your-base')
var pad = require('pad')

var conv = require('binstring');


//Testing converting a file to binary

var BitArray = require('node-bitarray')
fs.readFile('text.txt', function (err, data) {
  console.log(data)
  console.log(data.length)
  var binArray = new Array();
  for (var i = 0; i < data.length; i++) {
      binArray.push(data[i]);
  };
  console.log(binArray);
  //convert to bits
  var bitArray = new Array();
  for (var i = 0; i < binArray.length; i++) {
    var bin = ayb.decToBin(binArray[i]);
    //if less than 8 bits, pad with 0s.
    console.log(bin)
    console.log(bin.length)
    if (bin.length < 8){
      var gap =  8 - bin.length;
      console.log("Gap is " +gap);
      bin = pad(8,bin,'0')
      console.log(bin);
     
    }
    bitArray.push(bin);
  };
  console.log(bitArray);
  console.log(binArray);
  var bitStream = bitArray.join("");
  console.log(bitStream);
///THIS IS WHAT WE WANT :')'




  //Try it the other way around. Test going from bitstream to bits (every 8)
  // then convert those bits to decimals(binArray)
  // then write that binarray to a file
  var buff = new Buffer(binArray);

  console.log(buff)
  

  
});