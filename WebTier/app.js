const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const helpers = require('./helpers');
var rerun = require('./sqs_retrive');


app.use(express.static(__dirname + '/public'));
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});
app.listen(port, () => console.log(`Listening on port ${port}...`));


app.get('/', (req, res) => {
  res.sendFile('./index.html', { root: __dirname });
});

app.get('/page', function (req, res) {
  res.send('A message!');
});



app.get('/page', function (req, res) {
  res.send('A message!');
});



app.get('/get-result',(req,res)=>{

  var fs = require("fs");

  var data = '<hr/><a href="./get-result"><h3>Update results ....</h3></a>'+'<hr/><a href="./">Upload more images</a><hr />' ;
  
  var rStream = fs.readFileSync("results.txt", "utf8").split(/\r?\n/).forEach(function(line){
    data += line+"<br />";
  });
  res.send(data);

  

})

app.post('/upload-multiple-images', (req, res) => {
  // 10 is the limit I've defined for number of uploaded files at once
  // 'multiple_images' is the name of our file input field

  var fs = require('fs');

  fs.unlink('results.txt', function (err) {
    if (err) throw err;
    console.log('File deleted!');
  });



  fs.writeFile('results.txt', '', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });




  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('multiple_images', 1000);

  upload(req, res, function(err) {
      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
    


      let result = "You have uploaded these images: <hr />";
      const files = req.files;
      let index, len;


      res.send("success"+ '<hr/><a href="./">Upload more images</a>' + '<hr/><a href="./get-result">Show results ....</a>');
  });
});

