sTego
=====

> **ste·ga·no·graph·y**
> The practice of concealing messages or information within other nonsecret text or data.

</note>

sTego is a command line application built on JavaScript & Node.js to hide and reveal files from within images using LSB steganography (in tandem with AES-256-CTR encryption <i>for that extra kick</i>).

**What does that mean?**
Do you want to send secret messages to a ~~backdoor~~ friend, but you're afraid of it being deciphered?

Hide your ~~commands~~ messages within a harmless image and let it breeze past their suspicions. 

**Cool! Who built it?**
It was built by a cool BTECH Network Security Student named @TRatnayake for the COMP 8505 course at BCIT. 



----------
Requirements & Limitations
----------------------------
1.	Node.js version 0.12 or higher
2.	Cover image must be a .bmp

Usage
-------
You can use sTego in two ways, either via command line arguments (if you're a pro h4x0r) or via prompts.

First install dependencies `npm install`

1. Command Line Arguments:
**Hiding An Image**
Format: `node dcstego.js <embedFile> <coverImage> <outputFile> <encryptionKey>`
Example: ` node dcstego.js text.txt ./images/coverImage.bmp secretImage.bmp password`


	**Revealing An Image**
Format: `node dcstego.js  <secretFilePath> <decryptionKey>`
Example: `node dcstego.js secretImage.bmp password`


2. Prompts:
**Hiding An Image**
`node dcstego`


Features
-------------
 - Encryption! All messages are further encrypted using AES-256-CTR provided by the node.js CRYPTO module.
 - Amazing Efficiency! You can store 3 bits of information for each pixel in a cover image!
 - Cool Prompts! Multi-coloured terminal prompts, so you don't get confused by a non GUI interface


To-Do
------